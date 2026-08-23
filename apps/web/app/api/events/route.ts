import { NextResponse } from "next/server";
import { createDb, events } from "@bolivamos/db";
import { and, eq, gte, lt } from "drizzle-orm";
import { createEventRequestSchema, listEventsQuerySchema, type EventDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireRole } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { windowForFilter } from "@/lib/event-filters";

function toEventDto(event: typeof events.$inferSelect): EventDto {
  return {
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
  }
  if (query.category) {
    conditions.push(eq(events.category, query.category));
  }

  const rows = await db
    .select()
    .from(events)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(events.startTime);

  return NextResponse.json(rows.map(toEventDto));
}

/** Host-only: create an event for one of the host's venues. */
export async function POST(request: Request) {
  try {
    await requireRole(request, "host");
    const body = createEventRequestSchema.parse(await request.json());

    const { env } = cf();
    const db = createDb(env.DB);
    const id = crypto.randomUUID();

    await db.insert(events).values({
      id,
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
