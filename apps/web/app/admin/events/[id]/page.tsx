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
      <form action={updateEvent} className="a-form a-card" style={{ maxWidth: 560 }}>
        <input type="hidden" name="id" value={event.id} />

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Basics</h2>
          <div className="a-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" defaultValue={event.title} required className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" defaultValue={event.description ?? ""} className="a-textarea" />
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">When</h2>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="startTime">Starts</label>
              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                defaultValue={toLocalInput(event.startTime)}
                required
                className="a-input"
              />
            </div>
            <div className="a-field">
              <label htmlFor="endTime">
                Ends <span className="a-field-optional">(optional)</span>
              </label>
              <input
                id="endTime"
                name="endTime"
                type="datetime-local"
                defaultValue={toLocalInput(event.endTime)}
                className="a-input"
              />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Where</h2>
          <p className="a-fieldset-hint">Link to a registered venue, or fill venue name/district for an imported listing.</p>
          <div className="a-field">
            <label htmlFor="venueId">Registered venue</label>
            <select id="venueId" name="venueId" defaultValue={event.venueId ?? ""} className="a-select">
              <option value="">No venue (imported/aggregated listing)</option>
              {allVenues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="venueName">Venue name (imported listings)</label>
              <input id="venueName" name="venueName" defaultValue={event.venueName ?? ""} className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="district">District</label>
              <input id="district" name="district" defaultValue={event.district ?? ""} className="a-input" />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Listing details</h2>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" defaultValue={event.category ?? ""} className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="priceText">Price</label>
              <input
                id="priceText"
                name="priceText"
                defaultValue={event.priceText ?? ""}
                placeholder="e.g. 50 BOB"
                className="a-input"
              />
            </div>
          </div>
          <label className="a-checkbox-row">
            <input type="checkbox" name="isFree" defaultChecked={Boolean(event.isFree)} /> Free event
          </label>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Media &amp; map</h2>
          <div className="a-field">
            <label htmlFor="imageUrl">Image URL</label>
            <input id="imageUrl" name="imageUrl" defaultValue={event.imageUrl ?? ""} className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="mapsUrl">Google Maps URL</label>
            <input id="mapsUrl" name="mapsUrl" defaultValue={event.mapsUrl ?? ""} className="a-input" />
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="lat">Latitude</label>
              <input id="lat" name="lat" type="number" step="any" defaultValue={event.lat ?? ""} className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="lng">Longitude</label>
              <input id="lng" name="lng" type="number" step="any" defaultValue={event.lng ?? ""} className="a-input" />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Visibility</h2>
          <label className="a-checkbox-row">
            <input type="checkbox" name="isVipOnly" defaultChecked={Boolean(event.isVipOnly)} /> VIP&#8209;only
            (invite&#8209;only community party)
          </label>
          <label className="a-checkbox-row">
            <input type="checkbox" name="featured" defaultChecked={Boolean(event.featured)} /> Featured (priority placement)
          </label>
        </div>

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
