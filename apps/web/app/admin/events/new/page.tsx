import { createDb, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { createEvent } from "../../actions/events";

export default async function NewEventPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const allVenues = await db.select().from(venues);

  return (
    <div>
      <h1 className="a-h1">New event</h1>
      <form action={createEvent} className="a-form a-card">
        <input name="title" placeholder="Title" required className="a-input" />
        <textarea name="description" placeholder="Description" className="a-textarea" />
        <div className="a-row-2">
          <input name="startTime" type="datetime-local" required className="a-input" />
          <input name="endTime" type="datetime-local" className="a-input" />
        </div>
        <select name="venueId" className="a-select">
          <option value="">No venue (imported/aggregated listing)</option>
          {allVenues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <input name="venueName" placeholder="Venue name (for imported listings)" className="a-input" />
        <input name="district" placeholder="District" className="a-input" />
        <input name="category" placeholder="Category" className="a-input" />
        <input name="priceText" placeholder="Price text (e.g. 50 BOB)" className="a-input" />
        <label className="a-checkbox-row">
          <input type="checkbox" name="isFree" /> Free event
        </label>
        <input name="imageUrl" placeholder="Image URL" className="a-input" />
        <input name="mapsUrl" placeholder="Google Maps URL" className="a-input" />
        <div className="a-row-2">
          <input name="lat" type="number" step="any" placeholder="Latitude" className="a-input" />
          <input name="lng" type="number" step="any" placeholder="Longitude" className="a-input" />
        </div>
        <label className="a-checkbox-row">
          <input type="checkbox" name="isVipOnly" /> VIP&#8209;only (invite&#8209;only community party)
        </label>
        <label className="a-checkbox-row">
          <input type="checkbox" name="featured" /> Featured (priority placement)
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Create event
        </button>
      </form>
    </div>
  );
}
