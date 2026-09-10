import { NextResponse } from "next/server";
import { eq, or } from "@bolivibes/db";
import { createDb, orders, users, type Db } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { verifyStripeWebhookSignature } from "@/lib/stripe";

const THREE_MONTHS_MS = 3 * 30 * 24 * 60 * 60 * 1000;

interface StripeEvent {
  type: string;
  data: {
    object: {
      id: string;
      metadata?: { orderId?: string; userId?: string };
      customer?: string | null;
      subscription?: string | null;
      // Newer Stripe API versions moved the invoice's subscription id here
      // instead of the flat `subscription` field above — read both.
      parent?: { subscription_details?: { subscription?: string | null } | null } | null;
      // Invoice objects only.
      period_end?: number;
    };
  };
}

/** Marketplace one-time order — unchanged from before BoliPass billing existed. */
async function handleOrderPaid(db: Db, orderId: string) {
  await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
}

/** First successful checkout for a new BoliPass subscription. */
async function handleBolipassCheckoutCompleted(db: Db, userId: string, session: StripeEvent["data"]["object"]) {
  const stripeCustomerId = session.customer ?? null;
  const stripeSubscriptionId = session.subscription ?? null;
  await db
    .update(users)
    .set({
      stripeCustomerId,
      stripeSubscriptionId,
      isBolipassActive: true,
      // The first invoice's real period end isn't known at this event — this
      // is the one place "+3 months from now" is the right computation.
      // Renewals use the invoice's own period end instead (handleInvoicePaid).
      bolipassExpiresAt: new Date(Date.now() + THREE_MONTHS_MS).toISOString(),
    })
    .where(eq(users.id, userId));
}

/**
 * A renewal (or the first) invoice paid — extends the subscription.
 *
 * period_end is verified against a real captured Stripe test-mode payload
 * before this goes live with production Stripe traffic (no Stripe CLI is
 * available in this environment to trigger one directly) — see the plan's
 * Verification section. Looked up by customer id primarily (stable across
 * the API version that moved the invoice's subscription-id field in 2025),
 * with subscription id as a secondary OR'd correlation.
 */
async function handleInvoicePaid(db: Db, invoice: StripeEvent["data"]["object"]) {
  const stripeCustomerId = invoice.customer ?? null;
  const stripeSubscriptionId = invoice.subscription ?? invoice.parent?.subscription_details?.subscription ?? null;
  if (!stripeCustomerId && !stripeSubscriptionId) return;

  // Naturally idempotent against webhook retries — re-applying the same
  // invoice sets the same period-end value again, no drift.
  const expiresAt = invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null;

  const conditions = [
    stripeCustomerId ? eq(users.stripeCustomerId, stripeCustomerId) : null,
    stripeSubscriptionId ? eq(users.stripeSubscriptionId, stripeSubscriptionId) : null,
  ].filter((c) => c !== null);

  await db
    .update(users)
    .set({
      isBolipassActive: true,
      ...(expiresAt ? { bolipassExpiresAt: expiresAt } : {}),
    })
    .where(or(...conditions));
}

/** Subscription cancelled or ended (non-payment, final failed retry, etc.). */
async function handleSubscriptionDeleted(db: Db, subscriptionId: string) {
  // Stripe ids are left in place (not nulled) — they're the audit trail and
  // let a future resubscribe flow see the prior subscription.
  await db.update(users).set({ isBolipassActive: false }).where(eq(users.stripeSubscriptionId, subscriptionId));
}

export async function POST(request: Request) {
  const { env } = cf();
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature || !(await verifyStripeWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  const db = createDb(env.DB);

  switch (event.type) {
    case "checkout.session.completed": {
      const { orderId, userId } = event.data.object.metadata ?? {};
      if (orderId) {
        await handleOrderPaid(db, orderId);
      } else if (userId) {
        await handleBolipassCheckoutCompleted(db, userId, event.data.object);
      }
      break;
    }
    case "invoice.paid": {
      await handleInvoicePaid(db, event.data.object);
      break;
    }
    case "customer.subscription.deleted": {
      await handleSubscriptionDeleted(db, event.data.object.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
