import { createDb, events } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";

export default async function HostEventsPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const rows = await db.select().from(events);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Events</h1>

      {/* Placeholder form — needs client-side JS to POST JSON to /api/events; a plain HTML form submit won't match the route's expected body. */}
      <form action="/api/events" method="post" className="max-w-md space-y-3">
        <input name="venueId" placeholder="Venue ID" className="w-full rounded-md border p-2" required />
        <input name="title" placeholder="Title" className="w-full rounded-md border p-2" required />
        <textarea name="description" placeholder="Description" className="w-full rounded-md border p-2" />
        <input
          name="startTime"
          type="datetime-local"
          className="w-full rounded-md border p-2"
          required
        />
        <button type="submit" className="rounded-pill bg-boli-orange px-5 py-2 text-white">
          Create event
        </button>
      </form>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Venue</th>
            <th className="p-2">Starts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((event) => (
            <tr key={event.id} className="border-t">
              <td className="p-2">{event.title}</td>
              <td className="p-2">{event.venueId}</td>
              <td className="p-2">{event.startTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
