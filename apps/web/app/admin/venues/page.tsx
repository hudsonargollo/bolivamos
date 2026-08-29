import { createDb, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

export default async function AdminVenuesPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(venues);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase">Venues</h1>
        <a href="/admin/venues/new" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          New venue
        </a>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-bg-off-white">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Address</th>
              <th className="p-3">Host</th>
              <th className="p-3">Tier</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((venue) => (
              <tr key={venue.id} className="border-b last:border-0">
                <td className="p-3">
                  {venue.name}
                  {venue.featured && (
                    <span className="ml-2 rounded-pill bg-boli-yellow px-2 py-0.5 text-xs text-charcoal-dark">
                      Featured
                    </span>
                  )}
                </td>
                <td className="p-3">{venue.category}</td>
                <td className="p-3">{venue.address ?? "—"}</td>
                <td className="p-3">{venue.hostId ?? "unassigned"}</td>
                <td className="p-3">
                  {venue.tier === "premium" ? (
                    <span className="rounded-pill bg-boli-green px-2 py-0.5 text-xs text-white">premium</span>
                  ) : (
                    <span className="text-muted-clay-gray">free</span>
                  )}
                </td>
                <td className="p-3">
                  <a href={`/admin/venues/${venue.id}`} className="text-boli-green underline">
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
