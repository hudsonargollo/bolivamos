import { createDb, pushCampaigns } from "@bolivibes/db";
import { desc } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { sendPushCampaign } from "../actions/push";

export default async function AdminPushPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(pushCampaigns).orderBy(desc(pushCampaigns.createdAt));

  return (
    <div>
      <h1 className="a-h1">Push campaigns</h1>
      <p className="a-muted" style={{ marginTop: -12, marginBottom: 20 }}>
        Broadcasts to everyone with the app installed and notifications enabled, filtered by segment — not
        location-triggered (no geofencing is wired up yet).
      </p>

      <form action={sendPushCampaign} className="a-form a-card" style={{ maxWidth: 520, marginBottom: 28 }}>
        <div className="a-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required className="a-input" />
        </div>
        <div className="a-field">
          <label htmlFor="body">Message</label>
          <textarea id="body" name="body" required className="a-textarea" />
        </div>
        <div className="a-field">
          <label htmlFor="target">Send to</label>
          <select id="target" name="target" defaultValue="all" className="a-select">
            <option value="all">Everyone</option>
            <option value="vip">BoliPass VIP subscribers</option>
            <option value="host">Hosts</option>
          </select>
        </div>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Send now
        </button>
      </form>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Target</th>
              <th>Recipients</th>
              <th>Sent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td style={{ textTransform: "capitalize" }}>{c.target}</td>
                <td>{c.recipientCount ?? "—"}</td>
                <td>{c.sentAt?.slice(0, 16).replace("T", " ") ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="a-muted" style={{ textAlign: "center", padding: 32 }}>
                  No campaigns sent yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
