"use client";

import { useEffect, useState } from "react";
import type { AttendeeDto } from "@bolivamos/api-schema";

const pill = {
  fontWeight: 700,
  textDecoration: "none",
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontFamily: "Figtree, sans-serif",
  fontSize: 14,
} as const;

export default function ConnectPanel({ eventId, isVip }: { eventId: string; isVip: boolean }) {
  const [visible, setVisible] = useState(false);
  const [attendees, setAttendees] = useState<AttendeeDto[]>([]);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isVip) return;
    fetch(`/api/events/${eventId}/attendees`, { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<AttendeeDto[]>) : []))
      .then(setAttendees)
      .catch(() => {});
  }, [eventId, isVip]);

  if (!isVip) {
    return (
      <div style={{ background: "#fbf4e6", borderRadius: 16, padding: "16px 20px", margin: "0 0 24px" }}>
        <p style={{ margin: 0, color: "#7a6a52", fontWeight: 700 }}>
          🔒 BoliPass members can see who else is going and connect — upgrade to unlock.
        </p>
      </div>
    );
  }

  async function toggleVisible() {
    setBusy(true);
    const next = !visible;
    try {
      await fetch(`/api/events/${eventId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible: next }),
      });
      setVisible(next);
    } finally {
      setBusy(false);
    }
  }

  async function sendConnect(toUserId: string) {
    await fetch("/api/connect/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ eventId, toUserId }),
    });
    setSentTo((prev) => new Set(prev).add(toUserId));
  }

  return (
    <div style={{ background: "#fbf4e6", borderRadius: 16, padding: "16px 20px", margin: "0 0 24px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#33302c" }}>
        <input type="checkbox" checked={visible} onChange={toggleVisible} disabled={busy} />
        I&rsquo;m going — show me to other VIP members
      </label>
      {attendees.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {attendees.map((a) => (
            <div key={a.userId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#33302c" }}>{a.fullName ?? "A fellow VIP member"}</span>
              <button
                type="button"
                onClick={() => sendConnect(a.userId)}
                disabled={sentTo.has(a.userId)}
                style={{
                  ...pill,
                  background: sentTo.has(a.userId) ? "rgba(122,138,94,.25)" : "#c4703d",
                  color: sentTo.has(a.userId) ? "#4c5738" : "#f7f1e4",
                }}
              >
                {sentTo.has(a.userId) ? "Request sent" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
