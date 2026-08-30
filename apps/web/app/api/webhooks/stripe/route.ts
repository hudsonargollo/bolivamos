import { NextResponse } from "next/server";
import { eq } from "@bolivamos/db";
import { createDb, orders } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { verifyStripeWebhookSignature } from "@/lib/stripe";

/** Flips an order to 'paid' once Stripe confirms the Checkout Session completed. */
export async function POST(request: Request) {
  const { env } = cf();
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature || !(await verifyStripeWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data: { object: { id: string; metadata?: { orderId?: string } } };
  };

  if (event.type === "checkout.session.completed") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) {
      const db = createDb(env.DB);
      await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
    }
  }

  return NextResponse.json({ received: true });
}
