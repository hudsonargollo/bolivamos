import { notFound } from "next/navigation";
import { createDb, places } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { updatePlace, deletePlace } from "../../actions/places";
import { PLACE_LAYERS, layerLabel } from "../layer-labels";

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [place] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!place) notFound();

  return (
    <div>
      <h1 className="a-h1">Edit place</h1>
      <form action={updatePlace} className="a-form a-card" style={{ maxWidth: 520 }}>
        <input type="hidden" name="id" value={place.id} />

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Basics</h2>
          <div className="a-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={place.name} required className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="layer">Category</label>
            <select id="layer" name="layer" defaultValue={place.layer} required className="a-select">
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
              <input id="category" name="category" defaultValue={place.category ?? ""} className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="district">District</label>
              <input id="district" name="district" defaultValue={place.district ?? ""} className="a-input" />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Location</h2>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="lat">Latitude</label>
              <input id="lat" name="lat" type="number" step="any" defaultValue={place.lat ?? ""} className="a-input" />
            </div>
            <div className="a-field">
              <label htmlFor="lng">Longitude</label>
              <input id="lng" name="lng" type="number" step="any" defaultValue={place.lng ?? ""} className="a-input" />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Details</h2>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="rating">Rating</label>
              <input
                id="rating"
                name="rating"
                type="number"
                step="0.1"
                defaultValue={place.rating ?? ""}
                className="a-input"
              />
            </div>
            <div className="a-field">
              <label htmlFor="reviews">Review count</label>
              <input id="reviews" name="reviews" type="number" defaultValue={place.reviews ?? ""} className="a-input" />
            </div>
          </div>
          <div className="a-field">
            <label htmlFor="price">Price</label>
            <input id="price" name="price" defaultValue={place.price ?? ""} placeholder="e.g. $$" className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="venueId">
              Linked venue ID <span className="a-field-optional">(optional)</span>
            </label>
            <input id="venueId" name="venueId" defaultValue={place.venueId ?? ""} className="a-input" />
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Status</h2>
          <label className="a-checkbox-row">
            <input type="checkbox" name="regional" defaultChecked={Boolean(place.regional)} /> Regional / outside city core
          </label>
          <label className="a-checkbox-row">
            <input type="checkbox" name="verified" defaultChecked={Boolean(place.verified)} /> Verified (shows on public map)
          </label>
          <p className="a-muted" style={{ fontSize: 12 }}>
            Source: {place.source}
          </p>
        </div>

        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Save changes
        </button>
      </form>

      <form action={deletePlace} style={{ marginTop: 20 }}>
        <input type="hidden" name="id" value={place.id} />
        <button type="submit" className="clay-btn clay-danger">
          Delete place
        </button>
      </form>
    </div>
  );
}
