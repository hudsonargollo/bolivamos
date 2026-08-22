/**
 * Thin wrapper around the Gemini Flash `generateContent` REST endpoint.
 * The API key is always injected by the caller (from `env.GEMINI_API_KEY`
 * inside a Cloudflare Worker) — this module never reads it from process/env
 * itself, so it's impossible to accidentally bundle it into a client build.
 */

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiClientOptions {
  apiKey: string;
  model?: string;
}

export interface GenerateContentOptions {
  systemInstruction?: string;
  responseMimeType?: "text/plain" | "application/json";
}

export class GeminiClient {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(opts: GeminiClientOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? GEMINI_MODEL;
  }

  async generateContent(prompt: string, opts: GenerateContentOptions = {}): Promise<string> {
    const url = `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    if (opts.systemInstruction) {
      body.systemInstruction = { parts: [{ text: opts.systemInstruction }] };
    }
    if (opts.responseMimeType) {
      body.generationConfig = { responseMimeType: opts.responseMimeType };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini response contained no text candidate");
    }
    return text;
  }
}
