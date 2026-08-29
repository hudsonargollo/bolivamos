"use client";

import { useState } from "react";
import type { ChatResponse } from "@bolivamos/api-schema";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export default function ConciergeChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setError(null);
    setInput("");
    setTurns((prev) => [...prev, { role: "user", content: message }]);
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
      setTurns((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="a-card" style={{ display: "flex", flexDirection: "column", gap: 16, height: "70vh" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {turns.length === 0 && (
          <p className="a-muted">
            Ask about nightlife, transport, local dishes, dress codes, or anything to do tonight in Santa Cruz.
          </p>
        )}
        {turns.map((turn, i) => (
          <div
            key={i}
            style={{
              alignSelf: turn.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: turn.role === "user" ? "var(--a-orange)" : "var(--a-surface-hover)",
              color: turn.role === "user" ? "var(--a-cream-text)" : "var(--a-ink)",
              borderRadius: 14,
              padding: "10px 14px",
              fontSize: 14.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {turn.content}
          </div>
        ))}
        {sending && <p className="a-muted">Thinking…</p>}
      </div>
      {error && (
        <p className="a-text-orange" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the concierge…"
          className="a-input"
          disabled={sending}
        />
        <button type="submit" className="clay-btn" disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
