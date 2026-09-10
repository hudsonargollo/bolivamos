import { redirect } from "next/navigation";
import { or, eq } from "@bolivibes/db";
import { createDb, connectRequests, events, users } from "@bolivibes/db";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import { cf } from "@/lib/cloudflare";
import RequestActions from "./request-actions";

export default async function ConnectInboxPage() {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");

  const { env } = cf();
  const db = createDb(env.DB);

  const [rows, allEvents, allUsers] = await Promise.all([
    db
      .select()
      .from(connectRequests)
      .where(or(eq(connectRequests.fromUserId, session.userId), eq(connectRequests.toUserId, session.userId))),
    db.select().from(events),
    db.select().from(users),
  ]);
  const eventById = new Map(allEvents.map((e) => [e.id, e]));
  const userById = new Map(allUsers.map((u) => [u.id, u]));

  const incoming = rows.filter((r) => r.toUserId === session.userId && r.status === "pending");
  const accepted = rows.filter((r) => r.status === "accepted");
  const sent = rows.filter((r) => r.fromUserId === session.userId && r.status === "pending");

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "Figtree, sans-serif" }}>
      <h1 style={{ fontFamily: "Caprasimo, Georgia, serif", fontSize: 32, color: "#201e1d", margin: "0 0 24px" }}>
        Connect
      </h1>

      {incoming.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7a6a52", margin: "0 0 12px" }}>Requests for you</h2>
          {incoming.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fbf4e6",
                borderRadius: 14,
                padding: "12px 16px",
                marginBottom: 8,
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#33302c" }}>
                  {userById.get(r.fromUserId)?.fullName ?? "A fellow VIP member"}
                </p>
                <p style={{ margin: 0, color: "#7a6a52", fontSize: 13 }}>{eventById.get(r.eventId)?.title}</p>
              </div>
              <RequestActions requestId={r.id} />
            </div>
          ))}
        </section>
      )}

      {accepted.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7a6a52", margin: "0 0 12px" }}>Conversations</h2>
          {accepted.map((r) => {
            const otherId = r.fromUserId === session.userId ? r.toUserId : r.fromUserId;
            return (
              <a
                key={r.id}
                href={`/connect/${r.id}`}
                style={{
                  display: "block",
                  background: "#fbf4e6",
                  borderRadius: 14,
                  padding: "12px 16px",
                  marginBottom: 8,
                  textDecoration: "none",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: "#33302c" }}>
                  {userById.get(otherId)?.fullName ?? "A fellow VIP member"}
                </p>
                <p style={{ margin: 0, color: "#7a6a52", fontSize: 13 }}>{eventById.get(r.eventId)?.title}</p>
              </a>
            );
          })}
        </section>
      )}

      {sent.length > 0 && (
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7a6a52", margin: "0 0 12px" }}>Sent, awaiting reply</h2>
          {sent.map((r) => (
            <div key={r.id} style={{ padding: "8px 16px", color: "#7a6a52" }}>
              {userById.get(r.toUserId)?.fullName ?? "A fellow VIP member"} — {eventById.get(r.eventId)?.title}
            </div>
          ))}
        </section>
      )}

      {incoming.length === 0 && accepted.length === 0 && sent.length === 0 && (
        <p style={{ color: "#7a6a52" }}>
          No connections yet — opt in to be visible on an event page and connect with other VIP members going.
        </p>
      )}
    </main>
  );
}
