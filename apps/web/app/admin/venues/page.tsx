import { createDb, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

export default async function AdminVenuesPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(venues);

  return (
    <div>
      <div className="a-actions-row">
        <h1 className="a-h1" style={{ margin: 0 }}>
          Venues
        </h1>
        <a href="/admin/venues/new" className="clay-btn">
          New venue
        </a>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Address</th>
              <th>Host</th>
              <th>Tier</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((venue) => (
              <tr key={venue.id}>
                <td>
                  {venue.name}
                  {venue.featured && <span className="a-badge a-badge-orange">Featured</span>}
                </td>
                <td>{venue.category}</td>
                <td>{venue.address ?? "—"}</td>
                <td>{venue.hostId ?? "unassigned"}</td>
                <td>
                  {venue.tier === "premium" ? (
                    <span className="a-badge a-badge-sage" style={{ marginLeft: 0 }}>
                      premium
                    </span>
                  ) : (
                    <span className="a-muted">free</span>
                  )}
                </td>
                <td>
                  <a href={`/admin/venues/${venue.id}`} className="a-link">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
