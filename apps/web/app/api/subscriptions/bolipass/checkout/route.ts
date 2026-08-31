import { NextResponse } from "next/server";
import { eq } from "@bolivamos/db";
import { createDb, users } from "@bolivamos/db";
import { bolipassCheckoutRequestSchema, type BolipassCheckoutResponse } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { createSubscriptionCheckoutSession } from "@/lib/stripe";

const FULL_PRICE_USD = 50;
const BOLIVIAN_DISCOUNT_PRICE_USD = 25;

// Plausibility check only — numeric, roughly the documented length range for
// a Bolivian NIT (old 7-digit format through newer 13-digit format). This is
// NOT identity verification (no government API exists to check against);
// the discount is self-attested and the submitted NIT is kept on file for
// admin audit (see apps/web/app/admin/users/page.tsx), not validated against
// any registry.
const NIT_FORMAT = /^\d{7,13}$/;

/**
 * Starts a real, paid BoliPass subscription — replaces the old unguarded
 * POST /api/subscriptions/bolipass, which flipped any authenticated user to
 * VIP for free. Doesn't touch isBolipassActive itself; that only happens
 * once Stripe confirms payment via the webhook
 * (app/api/webhooks/stripe/route.ts).
 */
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = bolipassCheckoutRequestSchema.parse(await request.json().catch(() => ({})));

    const { env } = cf();
    const db = createDb(env.DB);

    const nitFormatValid = Boolean(body.nit && NIT_FORMAT.test(body.nit));
    const amountUsd = nitFormatValid ? BOLIVIAN_DISCOUNT_PRICE_USD : FULL_PRICE_USD;

    // Persisted at checkout-creation time regardless of whether payment
    // completes — captures the self-attestation as submitted rather than
    // conditioning storage on payment success.
    if (body.nit) {
      await db.update(users).set({ nit: body.nit }).where(eq(users.id, session.userId));
    }

    const origin = new URL(request.url).origin;
    const checkout = await createSubscriptionCheckoutSession({
      secretKey: env.STRIPE_SECRET_KEY,
      userId: session.userId,
      amountUsd,
      customerEmail: session.email,
      successUrl: `${origin}/bolipass/checkout-result?status=success`,
      cancelUrl: `${origin}/bolipass/checkout-result?status=cancelled`,
    });

    const response: BolipassCheckoutResponse = { checkoutUrl: checkout.url, amountUsd };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
