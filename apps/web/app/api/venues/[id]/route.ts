import { NextResponse } from "next/server";
import { createDb, venues } from "@bolivibes/db";
import { eq } from "@bolivibes/db";
import type { VenueDto, Category } from "@bolivibes/api-schema";
import { cf } from "@/lib/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [venue] = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
  if (!venue) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dto: VenueDto = {
    id: venue.id,
    slug: venue.slug,
    hostId: venue.hostId,
    name: venue.name,
    category: venue.category as Category,
    address: venue.address,
    latitude: venue.latitude,
    longitude: venue.longitude,
    createdAt: venue.createdAt,
    tier: venue.tier as VenueDto["tier"],
    featured: venue.featured,
  };
  return NextResponse.json(dto);
}
