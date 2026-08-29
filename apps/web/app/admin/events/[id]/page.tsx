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
    <div>
      <h1 className="a-h1">Edit event</h1>
      <form action={updateEvent} className="a-form a-card">
        <input type="hidden" name="id" value={event.id} />
        <input name="title" defaultValue={event.title} required className="a-input" />
        <textarea name="description" defaultValue={event.description ?? ""} className="a-textarea" />
        <div className="a-row-2">
          <input
            name="startTime"
            type="datetime-local"
            defaultValue={toLocalInput(event.startTime)}
            required
            className="a-input"
          />
          <input name="endTime" type="datetime-local" defaultValue={toLocalInput(event.endTime)} className="a-input" />
        </div>
        <select name="venueId" defaultValue={event.venueId ?? ""} className="a-select">
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
          className="a-input"
        />
        <input name="district" defaultValue={event.district ?? ""} placeholder="District" className="a-input" />
        <input name="category" defaultValue={event.category ?? ""} placeholder="Category" className="a-input" />
        <input
          name="priceText"
          defaultValue={event.priceText ?? ""}
          placeholder="Price text (e.g. 50 BOB)"
          className="a-input"
        />
        <label className="a-checkbox-row">
          <input type="checkbox" name="isFree" defaultChecked={Boolean(event.isFree)} /> Free event
        </label>
        <input name="imageUrl" defaultValue={event.imageUrl ?? ""} placeholder="Image URL" className="a-input" />
        <input name="mapsUrl" defaultValue={event.mapsUrl ?? ""} placeholder="Google Maps URL" className="a-input" />
        <div className="a-row-2">
          <input
            name="lat"
            type="number"
            step="any"
            defaultValue={event.lat ?? ""}
            placeholder="Latitude"
            className="a-input"
          />
          <input
            name="lng"
            type="number"
            step="any"
            defaultValue={event.lng ?? ""}
            placeholder="Longitude"
            className="a-input"
          />
        </div>
        <label className="a-checkbox-row">
          <input type="checkbox" name="isVipOnly" defaultChecked={Boolean(event.isVipOnly)} /> VIP&#8209;only (invite&#8209;only community party)
        </label>
        <label className="a-checkbox-row">
          <input type="checkbox" name="featured" defaultChecked={Boolean(event.featured)} /> Featured (priority placement)
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Save changes
        </button>
      </form>

      <form action={deleteEvent} style={{ marginTop: 20 }}>
        <input type="hidden" name="id" value={event.id} />
        <button type="submit" className="clay-btn clay-danger">
          Delete event
        </button>
      </form>
    </div>
  );
}
