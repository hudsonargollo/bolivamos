import { NextResponse } from "next/server";
import { eq } from "@bolivamos/db";
import { createDb, connectRequests } from "@bolivamos/db";
import { respondConnectRequestSchema } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** Only the recipient can accept/decline a connect request. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireSession(request);
    const body = respondConnectRequestSchema.parse(await request.json());

    const { env } = cf();
    const db = createDb(env.DB);

    const [existing] = await db.select().from(connectRequests).where(eq(connectRequests.id, id)).limit(1);
    if (!existing || existing.toUserId !== session.userId) {
      throw new SessionError(404, "Request not found");
    }

    await db
      .update(connectRequests)
      .set({ status: body.accept ? "accepted" : "declined" })
      .where(eq(connectRequests.id, id));

    return NextResponse.json({ status: body.accept ? "accepted" : "declined" });
  } catch (err) {
    return toErrorResponse(err);
  }
}
