import { NextResponse } from "next/server";
import { eq } from "@bolivibes/db";
import { GeminiClient, chatWithConcierge } from "@bolivibes/ai";
import { chatRequestSchema, type ChatResponse } from "@bolivibes/api-schema";
import { createDb, conciergeConversations, conciergeMessages } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** BoliPass-only Smart Concierge Chat (PRD 4.3), now with server-persisted history. */
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    if (!session.isBoliPass) {
      throw new SessionError(403, "BoliPass subscription required");
    }

    const body = chatRequestSchema.parse(await request.json());
    const { env } = cf();
    const db = createDb(env.DB);

    let conversationId = body.conversationId;
    if (conversationId) {
      const [conversation] = await db
        .select()
        .from(conciergeConversations)
        .where(eq(conciergeConversations.id, conversationId))
        .limit(1);
      if (!conversation || conversation.userId !== session.userId) {
        throw new SessionError(404, "Conversation not found");
      }
    } else {
      conversationId = crypto.randomUUID();
      await db.insert(conciergeConversations).values({ id: conversationId, userId: session.userId });
    }

    await db.insert(conciergeMessages).values({
      id: crypto.randomUUID(),
      conversationId,
      role: "user",
      content: body.message,
    });

    const client = new GeminiClient({ apiKey: env.GEMINI_API_KEY });
    const reply = await chatWithConcierge(client, body);

    await db.insert(conciergeMessages).values({
      id: crypto.randomUUID(),
      conversationId,
      role: "assistant",
      content: reply,
    });

    const response: ChatResponse = { reply, conversationId };
    return NextResponse.json(response);
  } catch (err) {
    return toErrorResponse(err);
  }
}
