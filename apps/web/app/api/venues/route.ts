import { NextResponse } from "next/server";
import { createDb, venues } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { createVenueRequestSchema, type VenueDto, type Category } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireRole } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

function toVenueDto(venue: typeof venues.$inferSelect): VenueDto {
  return {
    id: venue.id,
    hostId: venue.hostId,
    name: venue.name,
    category: venue.category as Category,
    address: venue.address,
    latitude: venue.latitude,
    longitude: venue.longitude,
    createdAt: venue.createdAt,
  };
}

export async function GET() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(venues);
  return NextResponse.json(rows.map(toVenueDto));
}

/** Host-only: create a venue owned by the authenticated host. */
export async function POST(request: Request) {
  try {
    const session = await requireRole(request, "host");
    const body = createVenueRequestSchema.parse(await request.json());

    const { env } = cf();
    const db = createDb(env.DB);
    const id = crypto.randomUUID();
    const qrSecretHash = crypto.randomUUID(); // placeholder secret; regenerate via a real HMAC key in production

    await db.insert(venues).values({
      id,
      hostId: session.userId,
      name: body.name,
      category: body.category,
      address: body.address ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      qrSecretHash,
    });

    const [created] = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
    if (!created) throw new Error("Failed to load created venue");
    return NextResponse.json(toVenueDto(created), { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
