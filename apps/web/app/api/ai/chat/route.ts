import { NextResponse } from "next/server";
import { GeminiClient, chatWithConcierge } from "@bolivamos/ai";
import { chatRequestSchema } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireRole } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** BoliPass-only Smart Concierge Chat (PRD 4.3). Single-turn for now — see packages/ai/src/chat.ts. */
export async function POST(request: Request) {
  try {
    const session = await requireRole(request, "visitor");
    if (!session.isBoliPass) {
      return NextResponse.json({ error: "BoliPass subscription required" }, { status: 403 });
    }

    const body = chatRequestSchema.parse(await request.json());
    const { env } = cf();
    const client = new GeminiClient({ apiKey: env.GEMINI_API_KEY });
    const reply = await chatWithConcierge(client, body);

    return NextResponse.json({ reply });
  } catch (err) {
    return toErrorResponse(err);
  }
}
