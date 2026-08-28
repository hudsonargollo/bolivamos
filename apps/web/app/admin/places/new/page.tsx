import { createPlace } from "../../actions/places";

const LAYERS = ["attraction", "eat_drink", "tour", "transfer", "street_zone"] as const;

export default function NewPlacePage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">New place</h1>
      <form action={createPlace} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <input name="name" placeholder="Name" required className="w-full rounded-md border p-2" />
        <select name="layer" required className="w-full rounded-md border p-2">
          {LAYERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input name="category" placeholder="Category" className="w-full rounded-md border p-2" />
        <input
          name="district"
          placeholder="District (e.g. Centro, Equipetrol)"
          className="w-full rounded-md border p-2"
        />
        <div className="flex gap-3">
          <input name="lat" type="number" step="any" placeholder="Latitude" className="w-full rounded-md border p-2" />
          <input name="lng" type="number" step="any" placeholder="Longitude" className="w-full rounded-md border p-2" />
        </div>
        <div className="flex gap-3">
          <input name="rating" type="number" step="0.1" placeholder="Rating" className="w-full rounded-md border p-2" />
          <input name="reviews" type="number" placeholder="Review count" className="w-full rounded-md border p-2" />
        </div>
        <input name="price" placeholder="Price (e.g. $$)" className="w-full rounded-md border p-2" />
        <input name="venueId" placeholder="Linked venue ID (optional)" className="w-full rounded-md border p-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="regional" /> Regional / outside city core
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="verified" defaultChecked /> Verified (shows on public map immediately)
        </label>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Create place
        </button>
      </form>
    </div>
  );
}
