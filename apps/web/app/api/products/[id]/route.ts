import { NextResponse } from "next/server";
import { createDb, products } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
import type { ProductDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dto: ProductDto = {
    id: product.id,
    type: product.type as ProductDto["type"],
    hostId: product.hostId,
    eventId: product.eventId,
    title: product.title,
    description: product.description,
    priceBob: product.priceBob,
    priceUsd: product.priceUsd,
    audioUrl: product.audioUrl,
    capacity: product.capacity,
    active: product.active,
    createdAt: product.createdAt,
  };
  return NextResponse.json(dto);
}
