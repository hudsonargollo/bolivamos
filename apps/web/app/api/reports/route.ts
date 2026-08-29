import { NextResponse } from "next/server";
import { createDb, userReports } from "@bolivamos/db";
import { reportUserRequestSchema } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** Files a report against a user — lands in the admin moderation queue. */
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = reportUserRequestSchema.parse(await request.json());

    if (body.reportedId === session.userId) {
      return NextResponse.json({ error: "Can't report yourself" }, { status: 400 });
    }

    const { env } = cf();
    const db = createDb(env.DB);

    await db.insert(userReports).values({
      id: crypto.randomUUID(),
      reporterId: session.userId,
      reportedId: body.reportedId,
      reason: body.reason,
      context: body.context ?? null,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
