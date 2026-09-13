import type { ChatRequest } from "@bolivibes/api-schema";

export interface BoliviaAiResponse {
  reply: string;
  provider?: string;
  model?: string;
  conversationId?: string;
}

export async function chatWithBoliviaAi(request: ChatRequest, opts: { endpoint: string; apiKey: string }): Promise<string> {
  const endpoint = opts.endpoint.replace(/\/$/, "");
  const response = await fetch(`${endpoint}/v1/bolivia/concierge`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`BolivIA VPS request failed: ${response.status} ${await response.text()}`);
  }

  const json = (await response.json()) as BoliviaAiResponse;
  if (!json.reply) {
    throw new Error("BolivIA VPS response contained no reply");
  }
  return json.reply;
}
