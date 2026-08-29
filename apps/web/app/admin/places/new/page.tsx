import { createPlace } from "../../actions/places";

const LAYERS = ["attraction", "eat_drink", "tour", "transfer", "street_zone"] as const;

export default function NewPlacePage() {
  return (
    <div>
      <h1 className="a-h1">New place</h1>
      <form action={createPlace} className="a-form a-card">
        <input name="name" placeholder="Name" required className="a-input" />
        <select name="layer" required className="a-select">
          {LAYERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input name="category" placeholder="Category" className="a-input" />
        <input name="district" placeholder="District (e.g. Centro, Equipetrol)" className="a-input" />
        <div className="a-row-2">
          <input name="lat" type="number" step="any" placeholder="Latitude" className="a-input" />
          <input name="lng" type="number" step="any" placeholder="Longitude" className="a-input" />
        </div>
        <div className="a-row-2">
          <input name="rating" type="number" step="0.1" placeholder="Rating" className="a-input" />
          <input name="reviews" type="number" placeholder="Review count" className="a-input" />
        </div>
        <input name="price" placeholder="Price (e.g. $$)" className="a-input" />
        <input name="venueId" placeholder="Linked venue ID (optional)" className="a-input" />
        <label className="a-checkbox-row">
          <input type="checkbox" name="regional" /> Regional / outside city core
        </label>
        <label className="a-checkbox-row">
          <input type="checkbox" name="verified" defaultChecked /> Verified (shows on public map immediately)
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Create place
        </button>
      </form>
    </div>
  );
}
