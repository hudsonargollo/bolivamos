import { createDb, places } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";
import { verifyPlace } from "../actions/places";
import { PLACE_LAYERS, layerLabel } from "./layer-labels";

function filterHref(layer?: string, status?: string): string {
  const params = new URLSearchParams();
  if (layer) params.set("layer", layer);
  if (status) params.set("status", status);
  const qs = params.toString();
  return qs ? `/admin/places?${qs}` : "/admin/places";
}

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ layer?: string; status?: string }>;
}) {
  const { layer: layerParam, status } = await searchParams;
  const layer = PLACE_LAYERS.find((l) => l === layerParam);
  const { env } = cf();
  const db = createDb(env.DB);
  const allRows = layer ? await db.select().from(places).where(eq(places.layer, layer)) : await db.select().from(places);

  const rows = (status === "pending" ? allRows.filter((p) => !p.verified) : allRows).sort(
    (a, b) => Number(a.verified) - Number(b.verified),
  );

  const pendingCount = allRows.filter((p) => !p.verified).length;

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

      <div className="a-filters">
        <a href={filterHref(undefined, status)} className={`a-filter-pill ${!layer ? "active" : ""}`}>
          All categories
        </a>
        {PLACE_LAYERS.map((l) => (
          <a key={l} href={filterHref(l, status)} className={`a-filter-pill ${layer === l ? "active" : ""}`}>
            {layerLabel(l)}
          </a>
        ))}
        <span className="a-filter-divider" />
        <a href={filterHref(layer, undefined)} className={`a-filter-pill ${!status ? "active" : ""}`}>
          All statuses
        </a>
        <a href={filterHref(layer, "pending")} className={`a-filter-pill ${status === "pending" ? "active" : ""}`}>
          Pending review <span className="count">{pendingCount}</span>
        </a>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
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
                <td>{layerLabel(place.layer)}</td>
                <td>{place.district ?? "—"}</td>
                <td style={{ textTransform: "capitalize" }}>{place.source}</td>
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="a-muted" style={{ textAlign: "center", padding: 32 }}>
                  No places match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
