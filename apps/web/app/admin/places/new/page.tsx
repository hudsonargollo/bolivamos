import { createPlace } from "../../actions/places";
import { PLACE_LAYERS, layerLabel } from "../layer-labels";

export default function NewPlacePage() {
  return (
    <div>
      <h1 className="a-h1">New place</h1>
      <form action={createPlace} className="a-form a-card" style={{ maxWidth: 520 }}>
        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Basics</h2>
          <div className="a-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="layer">Category</label>
            <select id="layer" name="layer" required className="a-select">
              {PLACE_LAYERS.map((l) => (
                <option key={l} value={l}>
                  {layerLabel(l)}
                </option>
              ))}
            </select>
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="category">Subcategory</label>
              <input id="category" name="category" className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="district">District</label>
              <input id="district" name="district" placeholder="e.g. Centro, Equipetrol" className="a-input" />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Location</h2>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="lat">Latitude</label>
              <input id="lat" name="lat" type="number" step="any" className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="lng">Longitude</label>
              <input id="lng" name="lng" type="number" step="any" className="a-input" />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Details</h2>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="rating">Rating</label>
              <input id="rating" name="rating" type="number" step="0.1" className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="reviews">Review count</label>
              <input id="reviews" name="reviews" type="number" className="a-input" />
            </div>
          </div>
          <div className="a-field">
            <label htmlFor="price">Price</label>
            <input id="price" name="price" placeholder="e.g. $$" className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="description">Place information</label>
            <textarea id="description" name="description" className="a-input" rows={4} />
          </div>
          <div className="a-field">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="googleMapsUrl">Google location URL</label>
            <input id="googleMapsUrl" name="googleMapsUrl" type="url" className="a-input" />
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="websiteUrl">Website / menu URL</label>
              <input id="websiteUrl" name="websiteUrl" type="url" className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="phone">Phone / WhatsApp</label>
              <input id="phone" name="phone" className="a-input" />
            </div>
          </div>
          <div className="a-field">
            <label htmlFor="venueId">
              Linked venue ID <span className="a-field-optional">(optional)</span>
            </label>
            <input id="venueId" name="venueId" className="a-input" />
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Status</h2>
          <label className="a-checkbox-row">
            <input type="checkbox" name="regional" /> Regional / outside city core
          </label>
          <label className="a-checkbox-row">
            <input type="checkbox" name="verified" defaultChecked /> Verified (shows on public map immediately)
          </label>
        </div>

        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Create place
        </button>
      </form>
    </div>
  );
}
