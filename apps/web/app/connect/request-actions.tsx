"use client";

import { useState } from "react";

export default function RequestActions({ requestId }: { requestId: string }) {
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  async function respond(accept: boolean) {
    const res = await fetch(`/api/connect/requests/${requestId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accept }),
    });
    if (res.ok) setDone(accept ? "accepted" : "declined");
  }

  if (done) return <span style={{ color: "#7a6a52", fontWeight: 700 }}>{done === "accepted" ? "Accepted" : "Declined"}</span>;

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        onClick={() => respond(true)}
        style={{
          fontWeight: 700,
          border: "none",
          borderRadius: 999,
          padding: "7px 14px",
          background: "#c4703d",
          color: "#f7f1e4",
          cursor: "pointer",
        }}
      >
        Accept
      </button>
      <button
        type="button"
        onClick={() => respond(false)}
        style={{
          fontWeight: 700,
          border: "none",
          borderRadius: 999,
          padding: "7px 14px",
          background: "rgba(196,113,57,.14)",
          color: "#8f4225",
          cursor: "pointer",
        }}
      >
        Decline
      </button>
    </div>
  );
}
