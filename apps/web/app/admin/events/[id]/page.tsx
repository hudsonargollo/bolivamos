import { notFound } from "next/navigation";
import { createDb, venues, events } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";
import { updateEvent, deleteEvent } from "../../actions/events";

function toLocalInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 16);
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) notFound();

  const allVenues = await db.select().from(venues);

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">Edit event</h1>
      <form action={updateEvent} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={event.id} />
        <input name="title" defaultValue={event.title} required className="w-full rounded-md border p-2" />
        <textarea
          name="description"
          defaultValue={event.description ?? ""}
          className="w-full rounded-md border p-2"
        />
        <div className="flex gap-3">
          <input
            name="startTime"
            type="datetime-local"
            defaultValue={toLocalInput(event.startTime)}
            required
            className="w-full rounded-md border p-2"
          />
          <input
            name="endTime"
            type="datetime-local"
            defaultValue={toLocalInput(event.endTime)}
            className="w-full rounded-md border p-2"
          />
        </div>
        <select name="venueId" defaultValue={event.venueId ?? ""} className="w-full rounded-md border p-2">
          <option value="">No venue (imported/aggregated listing)</option>
          {allVenues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <input
          name="venueName"
          defaultValue={event.venueName ?? ""}
          placeholder="Venue name (for imported listings)"
          className="w-full rounded-md border p-2"
        />
        <input name="district" defaultValue={event.district ?? ""} placeholder="District" className="w-full rounded-md border p-2" />
        <input name="category" defaultValue={event.category ?? ""} placeholder="Category" className="w-full rounded-md border p-2" />
        <input
          name="priceText"
          defaultValue={event.priceText ?? ""}
          placeholder="Price text (e.g. 50 BOB)"
          className="w-full rounded-md border p-2"
        />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFree" defaultChecked={Boolean(event.isFree)} /> Free event
        </label>
        <input name="imageUrl" defaultValue={event.imageUrl ?? ""} placeholder="Image URL" className="w-full rounded-md border p-2" />
        <input name="mapsUrl" defaultValue={event.mapsUrl ?? ""} placeholder="Google Maps URL" className="w-full rounded-md border p-2" />
        <div className="flex gap-3">
          <input
            name="lat"
            type="number"
            step="any"
            defaultValue={event.lat ?? ""}
            placeholder="Latitude"
            className="w-full rounded-md border p-2"
          />
          <input
            name="lng"
            type="number"
            step="any"
            defaultValue={event.lng ?? ""}
            placeholder="Longitude"
            className="w-full rounded-md border p-2"
          />
        </div>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Save changes
        </button>
      </form>

      <form action={deleteEvent}>
        <input type="hidden" name="id" value={event.id} />
        <button type="submit" className="rounded-pill bg-boli-red px-5 py-2 text-white">
          Delete event
        </button>
      </form>
    </div>
  );
}
