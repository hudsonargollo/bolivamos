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

  if (done) return <span className="bv-card-meta">{done === "accepted" ? "Accepted" : "Declined"}</span>;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" onClick={() => respond(true)} className="bv-btn" style={{ padding: "8px 14px", fontSize: 12 }}>
        Accept
      </button>
      <button type="button" onClick={() => respond(false)} className="bv-soft">
        Decline
      </button>
    </div>
  );
}
