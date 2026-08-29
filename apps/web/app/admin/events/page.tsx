import { createDb, events } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

export default async function AdminEventsPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(events).orderBy(events.startTime);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase">Events</h1>
        <a href="/admin/events/new" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          New event
        </a>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-bg-off-white">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Starts</th>
              <th className="p-3">Venue</th>
              <th className="p-3">Category</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((event) => (
              <tr key={event.id} className="border-b last:border-0">
                <td className="p-3">
                  {event.title}
                  {event.isVipOnly && (
                    <span className="ml-2 rounded-pill bg-charcoal-dark px-2 py-0.5 text-xs text-white">VIP</span>
                  )}
                  {event.featured && (
                    <span className="ml-2 rounded-pill bg-boli-yellow px-2 py-0.5 text-xs text-charcoal-dark">
                      Featured
                    </span>
                  )}
                </td>
                <td className="p-3">{event.startTime.slice(0, 16).replace("T", " ")}</td>
                <td className="p-3">{event.venueName ?? event.venueId ?? "—"}</td>
                <td className="p-3">{event.category ?? "—"}</td>
                <td className="p-3">
                  <a href={`/admin/events/${event.id}`} className="text-boli-green underline">
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
