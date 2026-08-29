import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createDb, products } from "@bolivamos/db";
import { productTypeSchema, type ProductDto } from "@bolivamos/api-schema";
import { z } from "zod";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

function toProductDto(product: typeof products.$inferSelect): ProductDto {
  return {
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
}

/** Public: active marketplace listings (tours, audio tours, event tickets). */
export async function GET() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(products).where(eq(products.active, true));
  return NextResponse.json(rows.map(toProductDto));
}

const createProductRequestSchema = z.object({
  type: productTypeSchema,
  eventId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  priceBob: z.number().positive(),
  priceUsd: z.number().positive().optional(),
  audioUrl: z.string().url().optional(),
  capacity: z.number().int().positive().optional(),
});

/** Host-only for their own tours/audio tours; admin can create any type (incl. tickets). */
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    if (session.role !== "host" && session.role !== "admin") {
      throw new SessionError(403, "Forbidden");
    }

    const body = createProductRequestSchema.parse(await request.json());
    if (session.role === "host" && body.type === "ticket") {
      throw new SessionError(403, "Only admins can create event tickets");
    }

    const { env } = cf();
    const db = createDb(env.DB);
    const id = crypto.randomUUID();

    await db.insert(products).values({
      id,
      type: body.type,
      hostId: session.role === "host" ? session.userId : null,
      eventId: body.eventId ?? null,
      title: body.title,
      description: body.description ?? null,
      priceBob: body.priceBob,
      priceUsd: body.priceUsd ?? null,
      audioUrl: body.audioUrl ?? null,
      capacity: body.capacity ?? null,
    });

    const [created] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!created) throw new Error("Failed to load created product");
    return NextResponse.json(toProductDto(created), { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
