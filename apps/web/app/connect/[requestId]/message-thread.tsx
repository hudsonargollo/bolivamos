"use client";

import { useEffect, useRef, useState } from "react";
import type { ConnectMessageDto } from "@bolivibes/api-schema";

export default function MessageThread({
  requestId,
  currentUserId,
  otherUserId,
  otherName,
}: {
  requestId: string;
  currentUserId: string;
  otherUserId: string;
  otherName: string;
}) {
  const [messages, setMessages] = useState<ConnectMessageDto[]>([]);
  const [input, setInput] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [reported, setReported] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/connect/${requestId}/messages`, { credentials: "include" });
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    const res = await fetch(`/api/connect/${requestId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    if (res.ok) loadMessages();
  }

  async function block() {
    await fetch(`/api/users/${otherUserId}/block`, { method: "POST", credentials: "include" });
    setBlocked(true);
  }

  async function report() {
    if (!reportReason.trim()) return;
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reportedId: otherUserId, reason: reportReason }),
    });
    setReported(true);
    setShowReport(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 26, color: "#201e1d", margin: 0 }}>
          {otherName}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setShowReport((v) => !v)} style={reportBtnStyle}>
            Report
          </button>
          <button type="button" onClick={block} disabled={blocked} style={reportBtnStyle}>
            {blocked ? "Blocked" : "Block"}
          </button>
        </div>
      </div>

      {showReport && (
        <div style={{ background: "#fbf4e6", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="What happened?"
            style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(122,106,82,.25)", padding: 10, fontFamily: "inherit" }}
          />
          <button type="button" onClick={report} style={{ ...reportBtnStyle, marginTop: 8, background: "#c4703d", color: "#f7f1e4" }}>
            Submit report
          </button>
        </div>
      )}
      {reported && <p style={{ color: "#7a6a52" }}>Report filed — an admin will review it.</p>}

      {blocked ? (
        <p style={{ color: "#7a6a52" }}>You've blocked this person. This conversation is now closed.</p>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "50vh", overflowY: "auto", marginBottom: 16 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.senderId === currentUserId ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  background: m.senderId === currentUserId ? "#c4703d" : "#fbf4e6",
                  color: m.senderId === currentUserId ? "#f7f1e4" : "#33302c",
                  borderRadius: 14,
                  padding: "9px 14px",
                  fontSize: 14.5,
                }}
              >
                {m.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message…"
              style={{ flex: 1, borderRadius: 999, border: "1px solid rgba(122,106,82,.25)", padding: "10px 16px", fontFamily: "inherit" }}
            />
            <button
              type="button"
              onClick={send}
              style={{ fontWeight: 700, border: "none", borderRadius: 999, padding: "10px 20px", background: "#c4703d", color: "#f7f1e4", cursor: "pointer" }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const reportBtnStyle = {
  fontWeight: 700,
  fontSize: 13,
  border: "none",
  borderRadius: 999,
  padding: "7px 14px",
  background: "rgba(196,113,57,.14)",
  color: "#8f4225",
  cursor: "pointer",
} as const;
