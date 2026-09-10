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
    <main className="bv-app-shell">
      <section className="bv-container-narrow">
        <p className="bv-section-kicker">Connect</p>
        <h1 className="bv-title">Go out together</h1>
        <p className="bv-subtitle">The web inbox now follows the mobile app card stack: soft clay surfaces, compact metadata, and fast actions.</p>

        {incoming.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 className="bv-title-sm" style={{ fontSize: 22 }}>Requests for you</h2>
            <div className="bv-stack">
              {incoming.map((r) => (
                <div key={r.id} className="bv-card bv-card-pad" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <p className="bv-card-title" style={{ margin: 0 }}>{userById.get(r.fromUserId)?.fullName ?? "A fellow VIP member"}</p>
                    <p className="bv-card-meta">{eventById.get(r.eventId)?.title}</p>
                  </div>
                  <RequestActions requestId={r.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {accepted.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 className="bv-title-sm" style={{ fontSize: 22 }}>Conversations</h2>
            <div className="bv-stack">
              {accepted.map((r) => {
                const otherId = r.fromUserId === session.userId ? r.toUserId : r.fromUserId;
                return (
                  <a key={r.id} href={`/connect/${r.id}`} className="bv-card bv-card-pad">
                    <p className="bv-card-title" style={{ margin: 0 }}>{userById.get(otherId)?.fullName ?? "A fellow VIP member"}</p>
                    <p className="bv-card-meta">{eventById.get(r.eventId)?.title}</p>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {sent.length > 0 && (
          <section>
            <h2 className="bv-title-sm" style={{ fontSize: 22 }}>Sent, awaiting reply</h2>
            <div className="bv-stack">
              {sent.map((r) => (
                <div key={r.id} className="bv-card bv-card-pad">
                  <p className="bv-card-title" style={{ margin: 0 }}>{userById.get(r.toUserId)?.fullName ?? "A fellow VIP member"}</p>
                  <p className="bv-card-meta">{eventById.get(r.eventId)?.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {incoming.length === 0 && accepted.length === 0 && sent.length === 0 && (
          <div className="bv-card bv-card-pad">
            <p className="bv-card-title" style={{ margin: 0 }}>No connections yet</p>
            <p className="bv-card-meta">Opt in on an event page and connect with other VIP members going.</p>
          </div>
        )}
      </section>
    </main>
  );
}
