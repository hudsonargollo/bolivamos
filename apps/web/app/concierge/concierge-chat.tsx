"use client";

import { useState } from "react";
import type { ChatResponse } from "@bolivibes/api-schema";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "Plan my night — what should I do tonight?",
  "Where do locals actually go?",
  "Can you help me book a table somewhere?",
  "How do I say \"two tickets please\" in Spanish?",
  "Plan my trip",
] as const;

export default function ConciergeChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendText(text: string) {
    const message = text.trim();
    if (!message || sending) return;

    setError(null);
    setInput("");
    const nextTurns = [...turns, { role: "user" as const, content: message }];
    setTurns(nextTurns);
    setSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, conversationId }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "The concierge couldn't reply. Try again.");
        return;
      }

      const data = (await res.json()) as ChatResponse;
      setConversationId(data.conversationId);
      setTurns([...nextTurns, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendText(input);
  }

  return (
    <div className="bv-chat-card">
      <div className="bv-chat-scroll">
        {turns.length === 0 && (
          <div className="bv-card bv-card-pad">
            <p className="bv-card-title" style={{ margin: 0 }}>Ask anything about Santa Cruz tonight.</p>
            <p className="bv-card-meta">Nightlife, transport, local dishes, dress codes, reservations or trip planning.</p>
          </div>
        )}
        {turns.map((turn, i) => (
          <div key={i} className={`bv-bubble ${turn.role === "user" ? "bv-bubble-user" : "bv-bubble-assistant"}`}>
            {turn.content}
          </div>
        ))}
        {sending && <p className="bv-card-meta">Thinking…</p>}
      </div>

      <div className="bv-chip-row" style={{ overflowX: "auto", flexWrap: "nowrap", paddingBottom: 8 }}>
        {QUICK_REPLIES.map((reply) => (
          <button key={reply} className="bv-chip" type="button" onClick={() => void sendText(reply)} disabled={sending}>
            {reply.split(" — ")[0]}
          </button>
        ))}
      </div>

      {error && <p className="bv-error" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="bv-chat-form">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the concierge…" className="bv-form-control" disabled={sending} />
        <button type="submit" className="bv-btn" disabled={sending || !input.trim()}>Send</button>
      </form>
    </div>
  );
}
