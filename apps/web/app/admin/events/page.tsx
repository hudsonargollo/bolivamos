import { createDb, events } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

export default async function AdminEventsPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(events).orderBy(events.startTime);

  return (
    <div>
      <div className="a-actions-row">
        <h1 className="a-h1" style={{ margin: 0 }}>
          Events
        </h1>
        <a href="/admin/events/new" className="clay-btn">
          New event
        </a>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Starts</th>
              <th>Venue</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((event) => (
              <tr key={event.id}>
                <td>
                  {event.title}
                  {event.isVipOnly && <span className="a-badge a-badge-charcoal">VIP</span>}
                  {event.featured && <span className="a-badge a-badge-orange">Featured</span>}
                </td>
                <td>{event.startTime.slice(0, 16).replace("T", " ")}</td>
                <td>{event.venueName ?? event.venueId ?? "—"}</td>
                <td>{event.category ?? "—"}</td>
                <td>
                  <a href={`/admin/events/${event.id}`} className="a-link">
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
