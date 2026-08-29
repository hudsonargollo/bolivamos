import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createDb, orders } from "@bolivamos/db";
import type { OrderDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** The buyer checking their own order's status (e.g. polling after a manual-payment redirect). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order || (order.userId !== session.userId && session.role !== "admin")) {
      throw new SessionError(404, "Order not found");
    }

    const dto: OrderDto = {
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
    return NextResponse.json(dto);
  } catch (err) {
    return toErrorResponse(err);
  }
}
