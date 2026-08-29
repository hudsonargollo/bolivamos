import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { createDb, eventAttendance } from "@bolivamos/db";
import { setAttendanceRequestSchema } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** Opts the current user in/out of being visible to other VIP attendees of this event. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const session = await requireSession(request);
    if (!session.isBoliPass) throw new SessionError(403, "BoliPass subscription required");

    const body = setAttendanceRequestSchema.parse(await request.json());
    const { env } = cf();
    const db = createDb(env.DB);

    const [existing] = await db
      .select()
      .from(eventAttendance)
      .where(and(eq(eventAttendance.eventId, eventId), eq(eventAttendance.userId, session.userId)))
      .limit(1);

    if (existing) {
      await db.update(eventAttendance).set({ visible: body.visible }).where(eq(eventAttendance.id, existing.id));
    } else {
      await db.insert(eventAttendance).values({
        id: crypto.randomUUID(),
        eventId,
        userId: session.userId,
        visible: body.visible,
      });
    }

    return NextResponse.json({ visible: body.visible });
  } catch (err) {
    return toErrorResponse(err);
  }
}
