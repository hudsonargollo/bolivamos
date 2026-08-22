import { NextResponse } from "next/server";
import { createDb, venues } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import type { VenueDto, Category } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [venue] = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dto: VenueDto = {
    id: venue.id,
    hostId: venue.hostId,
    name: venue.name,
    category: venue.category as Category,
    address: venue.address,
    latitude: venue.latitude,
    longitude: venue.longitude,
    createdAt: venue.createdAt,
  };
  return NextResponse.json(dto);
}
