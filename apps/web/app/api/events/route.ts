import { NextResponse } from "next/server";
import { createDb, events, generateUniqueSlug } from "@bolivamos/db";
import { and, desc, eq, gte, isNull, lt, or } from "@bolivamos/db";
import { createEventRequestSchema, listEventsQuerySchema, type EventDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { getCurrentSession, requireRole } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { windowForFilter } from "@/lib/event-filters";

function toEventDto(event: typeof events.$inferSelect): EventDto {
  return {
    id: event.id,
    slug: event.slug,
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
    isVipOnly: event.isVipOnly,
    featured: event.featured,
  };
}

/**
 * VIP-only events (roadmap pillar 1 — invite-only community parties) still
 * show up for everyone, so free-tier users feel the FOMO, but the exact
 * details that would let a non-subscriber actually attend are withheld.
 */
function applyVipGate(dto: EventDto, isVip: boolean): EventDto {
  if (!dto.isVipOnly || isVip) return dto;
  return {
    ...dto,
    description: null,
    imageUrl: null,
    mapsUrl: null,
    lat: null,
    lng: null,
    locked: true,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = listEventsQuerySchema.parse(Object.fromEntries(url.searchParams));

  const { env } = cf();
  const db = createDb(env.DB);

  const conditions = [];
  if (query.filter) {
    const { start, end } = windowForFilter(query.filter);
    conditions.push(gte(events.startTime, start.toISOString()), lt(events.startTime, end.toISOString()));
  } else {
    // No explicit day filter — still archive events that are over (mirrors
    // apps/web/lib/event-filters.ts's isEventPast), so past events don't
    // linger in the default public listing forever.
    const nowIso = new Date().toISOString();
    conditions.push(or(gte(events.endTime, nowIso), and(isNull(events.endTime), gte(events.startTime, nowIso))));
  }
  if (query.category) {
    conditions.push(eq(events.category, query.category));
  }

  const rows = await db
    .select()
    .from(events)
    .where(conditions.length ? and(...conditions) : undefined)
    // Featured listings surface first (roadmap pillar 2 paid placement), then soonest-starting.
    .orderBy(desc(events.featured), events.startTime);

  const session = await getCurrentSession(request);
  const isVip = Boolean(session?.isBoliPass);

  return NextResponse.json(rows.map((row) => applyVipGate(toEventDto(row), isVip)));
}

/** Host-only: create an event for one of the host's venues. */
export async function POST(request: Request) {
  try {
    await requireRole(request, "host");
    const body = createEventRequestSchema.parse(await request.json());

    const { env } = cf();
    const db = createDb(env.DB);
    const id = crypto.randomUUID();
    const slug = await generateUniqueSlug(db, events, events.slug, body.title);

    await db.insert(events).values({
      id,
      slug,
      venueId: body.venueId,
      title: body.title,
      description: body.description ?? null,
      startTime: body.startTime,
      endTime: body.endTime ?? null,
      imageUrl: body.imageUrl ?? null,
    });

    const [created] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!created) throw new Error("Failed to load created event");
    return NextResponse.json(toEventDto(created), { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
