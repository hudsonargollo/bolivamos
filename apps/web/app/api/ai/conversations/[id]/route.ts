import { NextResponse } from "next/server";
import { eq } from "@bolivibes/db";
import { createDb, conciergeConversations, conciergeMessages } from "@bolivibes/db";
import type { ConciergeMessageDto } from "@bolivibes/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** Fetches one of the current user's own concierge conversations, in order. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);

    const [conversation] = await db
      .select()
      .from(conciergeConversations)
      .where(eq(conciergeConversations.id, id))
      .limit(1);
    if (!conversation || conversation.userId !== session.userId) {
      throw new SessionError(404, "Conversation not found");
    }

    const rows = await db.select().from(conciergeMessages).where(eq(conciergeMessages.conversationId, id));
    const dto: ConciergeMessageDto[] = rows.map((row) => ({
      id: row.id,
      role: row.role as ConciergeMessageDto["role"],
      content: row.content,
      createdAt: row.createdAt,
    }));
    return NextResponse.json(dto);
  } catch (err) {
    return toErrorResponse(err);
  }
}
