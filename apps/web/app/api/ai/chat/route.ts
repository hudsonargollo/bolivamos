import { NextResponse } from "next/server";
import { eq } from "@bolivibes/db";
import { chatRequestSchema, type ChatResponse } from "@bolivibes/api-schema";
import { createDb, conciergeConversations, conciergeMessages } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { requireSession, SessionError } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";
import { chatWithBoliviaAi } from "@/lib/bolivia-ai";

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

    const reply = await chatWithBoliviaAi(body, {
      endpoint: env.BOLIVIA_AI_ENDPOINT,
      apiKey: env.BOLIVIA_AI_API_KEY,
    });

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
