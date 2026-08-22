import type { ChatRequest } from "@bolivamos/api-schema";
import { GeminiClient } from "./gemini-client";

const CONCIERGE_SYSTEM_PROMPT =
  "You are the BoliVamos Concierge, a friendly local guide for Santa Cruz de la Sierra, Bolivia. " +
  "Answer questions about nightlife, transport, local dishes, dress codes, and things to do. Keep replies concise.";

/**
 * Smart Concierge Chat (PRD 4.3). Stubbed as a single-turn call; a real
 * implementation would stream tokens and pass `history` as multi-turn contents.
 */
export async function chatWithConcierge(client: GeminiClient, request: ChatRequest): Promise<string> {
  const historyText = request.history
    .map((turn) => `${turn.role}: ${turn.content}`)
    .join("\n");
  const prompt = historyText ? `${historyText}\nuser: ${request.message}` : request.message;

  return client.generateContent(prompt, { systemInstruction: CONCIERGE_SYSTEM_PROMPT });
}
