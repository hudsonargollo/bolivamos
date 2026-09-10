import { createDb, userReports, users } from "@bolivibes/db";
import { eq, desc } from "@bolivibes/db";
import { cf } from "@/lib/cloudflare";
import { dismissReport, banReportedUser } from "../actions/moderation";

export default async function AdminModerationPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const [rows, allUsers] = await Promise.all([
    db.select().from(userReports).where(eq(userReports.status, "open")).orderBy(desc(userReports.createdAt)),
    db.select().from(users),
  ]);
  const userById = new Map(allUsers.map((u) => [u.id, u]));

  return (
    <div>
      <h1 className="a-h1">Moderation</h1>
      <p className="a-muted" style={{ marginTop: -12, marginBottom: 20 }}>
        Open reports from VIP Connect. Dismiss if there's nothing to act on, or ban — a banned user's session stops
        working immediately, everywhere.
      </p>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Reported</th>
              <th>Reason</th>
              <th>Context</th>
              <th>Filed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((report) => (
              <tr key={report.id}>
                <td>{userById.get(report.reporterId)?.email ?? report.reporterId}</td>
                <td>{userById.get(report.reportedId)?.email ?? report.reportedId}</td>
                <td>{report.reason}</td>
                <td className="a-muted">{report.context ?? "—"}</td>
                <td>{report.createdAt?.slice(0, 16).replace("T", " ") ?? "—"}</td>
                <td>
                  <div className="a-checkbox-row">
                    <form action={dismissReport}>
                      <input type="hidden" name="id" value={report.id} />
                      <button type="submit" className="a-btn-sm">
                        Dismiss
                      </button>
                    </form>
                    <form action={banReportedUser}>
                      <input type="hidden" name="id" value={report.id} />
                      <input type="hidden" name="reportedId" value={report.reportedId} />
                      <button type="submit" className="clay-btn clay-danger clay-btn-sm">
                        Ban user
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="a-muted" style={{ textAlign: "center", padding: 32 }}>
                  No open reports.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
