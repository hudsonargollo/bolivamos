import { NextResponse } from "next/server";
import { eq, or, and } from "drizzle-orm";
import { createDb, connectRequests } from "@bolivamos/db";
import { createConnectRequestSchema, type ConnectRequestDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { isBlockedEitherWay } from "@/lib/connect-guard";

function toDto(row: typeof connectRequests.$inferSelect): ConnectRequestDto {
  return {
    id: row.id,
    eventId: row.eventId,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    status: row.status as ConnectRequestDto["status"],
    createdAt: row.createdAt,
  };
}

/** Requests the current user sent or received. */
export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);

    const rows = await db
      .select()
      .from(connectRequests)
      .where(or(eq(connectRequests.fromUserId, session.userId), eq(connectRequests.toUserId, session.userId)));

    return NextResponse.json(rows.map(toDto));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    if (!session.isBoliPass) throw new SessionError(403, "BoliPass subscription required");

    const body = createConnectRequestSchema.parse(await request.json());
    if (body.toUserId === session.userId) {
      return NextResponse.json({ error: "Can't connect with yourself" }, { status: 400 });
    }

    const { env } = cf();
    const db = createDb(env.DB);

    if (await isBlockedEitherWay(db, session.userId, body.toUserId)) {
      return NextResponse.json({ error: "Can't send a request to this user" }, { status: 403 });
    }

    const [existing] = await db
      .select()
      .from(connectRequests)
      .where(
        and(
          eq(connectRequests.eventId, body.eventId),
          eq(connectRequests.fromUserId, session.userId),
          eq(connectRequests.toUserId, body.toUserId),
        ),
      )
      .limit(1);
    if (existing) return NextResponse.json(toDto(existing), { status: 200 });

    const id = crypto.randomUUID();
    await db.insert(connectRequests).values({
      id,
      eventId: body.eventId,
      fromUserId: session.userId,
      toUserId: body.toUserId,
    });

    const [created] = await db.select().from(connectRequests).where(eq(connectRequests.id, id)).limit(1);
    if (!created) throw new Error("Failed to load created request");
    return NextResponse.json(toDto(created), { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
