import { NextResponse } from "next/server";
import { eq, desc } from "@bolivibes/db";
import { createDb, conciergeConversations } from "@bolivibes/db";
import type { ConciergeConversationDto } from "@bolivibes/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** Lists the current user's own concierge conversations, most recent first. */
export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);

    const rows = await db
      .select()
      .from(conciergeConversations)
      .where(eq(conciergeConversations.userId, session.userId))
      .orderBy(desc(conciergeConversations.createdAt));

    const dto: ConciergeConversationDto[] = rows.map((row) => ({ id: row.id, createdAt: row.createdAt }));
    return NextResponse.json(dto);
  } catch (err) {
    return toErrorResponse(err);
  }
}
