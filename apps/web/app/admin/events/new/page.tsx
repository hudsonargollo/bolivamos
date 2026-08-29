import { createDb, venues } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { createEvent } from "../../actions/events";

export default async function NewEventPage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const allVenues = await db.select().from(venues);

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">New event</h1>
      <form action={createEvent} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <input name="title" placeholder="Title" required className="w-full rounded-md border p-2" />
        <textarea name="description" placeholder="Description" className="w-full rounded-md border p-2" />
        <div className="flex gap-3">
          <input
            name="startTime"
            type="datetime-local"
            required
            className="w-full rounded-md border p-2"
          />
          <input name="endTime" type="datetime-local" className="w-full rounded-md border p-2" />
        </div>
        <select name="venueId" className="w-full rounded-md border p-2">
          <option value="">No venue (imported/aggregated listing)</option>
          {allVenues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
        <input name="venueName" placeholder="Venue name (for imported listings)" className="w-full rounded-md border p-2" />
        <input name="district" placeholder="District" className="w-full rounded-md border p-2" />
        <input name="category" placeholder="Category" className="w-full rounded-md border p-2" />
        <input name="priceText" placeholder="Price text (e.g. 50 BOB)" className="w-full rounded-md border p-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFree" /> Free event
        </label>
        <input name="imageUrl" placeholder="Image URL" className="w-full rounded-md border p-2" />
        <input name="mapsUrl" placeholder="Google Maps URL" className="w-full rounded-md border p-2" />
        <div className="flex gap-3">
          <input name="lat" type="number" step="any" placeholder="Latitude" className="w-full rounded-md border p-2" />
          <input name="lng" type="number" step="any" placeholder="Longitude" className="w-full rounded-md border p-2" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isVipOnly" /> VIP&#8209;only (invite&#8209;only community party)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" /> Featured (priority placement)
        </label>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Create event
        </button>
      </form>
    </div>
  );
}
