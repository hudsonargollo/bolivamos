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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase">Places</h1>
        <a href="/admin/places/new" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          New place
        </a>
      </div>
      <p className="text-sm text-muted-clay-gray">
        Only verified places show on the public themed map. Imported/geocoded rows land here unverified for QA.
      </p>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-bg-off-white">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Layer</th>
              <th className="p-3">District</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((place) => (
              <tr key={place.id} className={`border-b last:border-0 ${place.verified ? "" : "bg-boli-yellow/10"}`}>
                <td className="p-3">{place.name}</td>
                <td className="p-3">{place.layer}</td>
                <td className="p-3">{place.district ?? "—"}</td>
                <td className="p-3">{place.source}</td>
                <td className="p-3">
                  {place.verified ? (
                    <span className="text-boli-green">Verified</span>
                  ) : (
                    <form action={verifyPlace} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={place.id} />
                      <span className="text-boli-orange">Pending</span>
                      <button type="submit" className="rounded-pill border px-3 py-1 text-xs">
                        Verify
                      </button>
                    </form>
                  )}
                </td>
                <td className="p-3">
                  <a href={`/admin/places/${place.id}`} className="text-boli-green underline">
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
