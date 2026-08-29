import { createDb, places } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { verifyPlace } from "../actions/places";

export default async function AdminPlacesPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(places);
  // Unverified rows first — they're the ones needing action.
  rows.sort((a, b) => Number(a.verified) - Number(b.verified));

  return (
    <div>
      <div className="a-actions-row">
        <h1 className="a-h1" style={{ margin: 0 }}>
          Places
        </h1>
        <a href="/admin/places/new" className="clay-btn">
          New place
        </a>
      </div>
      <p className="a-muted" style={{ marginTop: -12, marginBottom: 20 }}>
        Only verified places show on the public themed map. Imported/geocoded rows land here unverified for QA.
      </p>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Layer</th>
              <th>District</th>
              <th>Source</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((place) => (
              <tr key={place.id} className={place.verified ? undefined : "a-row-pending"}>
                <td>{place.name}</td>
                <td>{place.layer}</td>
                <td>{place.district ?? "—"}</td>
                <td>{place.source}</td>
                <td>
                  {place.verified ? (
                    <span className="a-text-sage">Verified</span>
                  ) : (
                    <form action={verifyPlace} className="a-checkbox-row">
                      <input type="hidden" name="id" value={place.id} />
                      <span className="a-text-orange">Pending</span>
                      <button type="submit" className="a-btn-sm">
                        Verify
                      </button>
                    </form>
                  )}
                </td>
                <td>
                  <a href={`/admin/places/${place.id}`} className="a-link">
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
