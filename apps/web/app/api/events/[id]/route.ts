import { NextResponse } from "next/server";
import { createDb, events } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
import type { EventDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { getCurrentSession } from "@/lib/session";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getCurrentSession(request);
  const isVip = Boolean(session?.isBoliPass);
  const locked = Boolean(event.isVipOnly) && !isVip;

  const dto: EventDto = {
    id: event.id,
    slug: event.slug,
    venueId: event.venueId,
    title: event.title,
    description: locked ? null : event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    imageUrl: locked ? null : event.imageUrl,
    category: event.category,
    priceText: event.priceText,
    isFree: event.isFree,
    venueName: event.venueName,
    district: event.district,
    mapsUrl: locked ? null : event.mapsUrl,
    lat: locked ? null : event.lat,
    lng: locked ? null : event.lng,
    isVipOnly: event.isVipOnly,
    featured: event.featured,
    ...(locked ? { locked: true } : {}),
  };
  return NextResponse.json(dto);
}
