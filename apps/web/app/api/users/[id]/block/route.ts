import { NextResponse } from "next/server";
import { eq, and, or } from "drizzle-orm";
import { createDb, userBlocks, connectRequests } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** Blocks a user — any authenticated user can do this defensively, not just VIPs. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: blockedId } = await params;
    const session = await requireSession(request);
    if (blockedId === session.userId) {
      return NextResponse.json({ error: "Can't block yourself" }, { status: 400 });
    }

    const { env } = cf();
    const db = createDb(env.DB);

    const [existing] = await db
      .select()
      .from(userBlocks)
      .where(and(eq(userBlocks.blockerId, session.userId), eq(userBlocks.blockedId, blockedId)))
      .limit(1);

    if (!existing) {
      await db.insert(userBlocks).values({ id: crypto.randomUUID(), blockerId: session.userId, blockedId });
    }

    // Blocking also closes out any pending request between the two of them.
    await db
      .update(connectRequests)
      .set({ status: "declined" })
      .where(
        and(
          eq(connectRequests.status, "pending"),
          or(
            and(eq(connectRequests.fromUserId, session.userId), eq(connectRequests.toUserId, blockedId)),
            and(eq(connectRequests.fromUserId, blockedId), eq(connectRequests.toUserId, session.userId)),
          ),
        ),
      );

    return NextResponse.json({ blocked: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
