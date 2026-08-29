import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import { createDb, eventAttendance, users } from "@bolivamos/db";
import type { AttendeeDto } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { isBlockedEitherWay } from "@/lib/connect-guard";

/** Visible VIP attendees of this event, excluding anyone blocking/blocked-by the viewer. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const session = await requireSession(request);
    if (!session.isBoliPass) throw new SessionError(403, "BoliPass subscription required");

    const { env } = cf();
    const db = createDb(env.DB);

    const rows = await db
      .select({ userId: eventAttendance.userId, fullName: users.fullName })
      .from(eventAttendance)
      .innerJoin(users, eq(users.id, eventAttendance.userId))
      .where(
        and(
          eq(eventAttendance.eventId, eventId),
          eq(eventAttendance.visible, true),
          ne(eventAttendance.userId, session.userId),
        ),
      );

    const visible: AttendeeDto[] = [];
    for (const row of rows) {
      if (await isBlockedEitherWay(db, session.userId, row.userId)) continue;
      visible.push({ userId: row.userId, fullName: row.fullName });
    }

    return NextResponse.json(visible);
  } catch (err) {
    return toErrorResponse(err);
  }
}
