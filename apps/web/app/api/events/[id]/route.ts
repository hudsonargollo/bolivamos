import { NextResponse } from "next/server";
import { createDb, events } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import type { EventDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dto: EventDto = {
    id: event.id,
    venueId: event.venueId,
    title: event.title,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    imageUrl: event.imageUrl,
    category: event.category,
    priceText: event.priceText,
    isFree: event.isFree,
    venueName: event.venueName,
    district: event.district,
    mapsUrl: event.mapsUrl,
    lat: event.lat,
    lng: event.lng,
  };
  return NextResponse.json(dto);
}
