import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { createDb, products, paymentMethods, orders } from "@bolivamos/db";
import { createOrderRequestSchema, type CreateOrderResponse, type OrderDto, type PaymentMethodDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { createCheckoutSession } from "@/lib/stripe";

function toOrderDto(order: typeof orders.$inferSelect): OrderDto {
  return {
    id: order.id,
    productId: order.productId,
    userId: order.userId,
    quantity: order.quantity,
    totalPriceBob: order.totalPriceBob,
    paymentMethod: order.paymentMethod as OrderDto["paymentMethod"],
    referenceNote: order.referenceNote,
    status: order.status as OrderDto["status"],
    createdAt: order.createdAt,
  };
}

/**
 * Creates a pending order, then branches on payment method: Stripe gets a
 * real Checkout Session (charged in USD — see lib/stripe.ts); the manual
 * rails (QR Bolivia, QR PIX, crypto) return the admin-managed receiving
 * details for the client to display, and stay 'pending' until an admin
 * confirms via POST /api/orders/[id]/confirm.
 */
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = createOrderRequestSchema.parse(await request.json());

    const { env } = cf();
    const db = createDb(env.DB);

    const [product] = await db.select().from(products).where(eq(products.id, body.productId)).limit(1);
    if (!product || !product.active) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const orderId = crypto.randomUUID();
    const totalPriceBob = product.priceBob * body.quantity;

    let stripeCheckoutUrl: string | null = null;
    let stripeSessionId: string | null = null;
    let paymentInstructions: PaymentMethodDto | null = null;

    if (body.paymentMethod === "stripe") {
      if (!product.priceUsd) {
        return NextResponse.json({ error: "This product isn't available for card payment yet" }, { status: 400 });
      }
      const origin = new URL(request.url).origin;
      const checkout = await createCheckoutSession({
        secretKey: env.STRIPE_SECRET_KEY,
        orderId,
        productTitle: product.title,
        amountUsd: product.priceUsd * body.quantity,
        quantity: 1,
        successUrl: `${origin}/marketplace/${product.id}?order=${orderId}&status=success`,
        cancelUrl: `${origin}/marketplace/${product.id}?order=${orderId}&status=cancelled`,
      });
      stripeCheckoutUrl = checkout.url;
      stripeSessionId = checkout.id;
    } else {
      const [method] = await db
        .select()
        .from(paymentMethods)
        .where(and(eq(paymentMethods.method, body.paymentMethod), eq(paymentMethods.active, true)))
        .limit(1);
      if (!method) {
        return NextResponse.json({ error: "That payment method isn't configured yet" }, { status: 400 });
      }
      paymentInstructions = {
        id: method.id,
        method: method.method as PaymentMethodDto["method"],
        label: method.label,
        qrImageUrl: method.qrImageUrl,
        addressOrKey: method.addressOrKey,
        instructions: method.instructions,
        active: method.active,
      };
    }

    await db.insert(orders).values({
      id: orderId,
      productId: product.id,
      userId: session.userId,
      quantity: body.quantity,
      totalPriceBob,
      paymentMethod: body.paymentMethod,
      referenceNote: body.referenceNote ?? null,
      stripeSessionId,
    });

    const [created] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!created) throw new Error("Failed to load created order");

    const response: CreateOrderResponse = {
      order: toOrderDto(created),
      stripeCheckoutUrl,
      paymentInstructions,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
