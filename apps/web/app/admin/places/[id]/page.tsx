import { notFound } from "next/navigation";
import { createDb, places } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";
import { updatePlace, deletePlace } from "../../actions/places";

const LAYERS = ["attraction", "eat_drink", "tour", "transfer", "street_zone"] as const;

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [place] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!place) notFound();

  return (
    <div>
      <h1 className="a-h1">Edit place</h1>
      <form action={updatePlace} className="a-form a-card">
        <input type="hidden" name="id" value={place.id} />
        <input name="name" defaultValue={place.name} required className="a-input" />
        <select name="layer" defaultValue={place.layer} required className="a-select">
          {LAYERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input name="category" defaultValue={place.category ?? ""} placeholder="Category" className="a-input" />
        <input name="district" defaultValue={place.district ?? ""} placeholder="District" className="a-input" />
        <div className="a-row-2">
          <input
            name="lat"
            type="number"
            step="any"
            defaultValue={place.lat ?? ""}
            placeholder="Latitude"
            className="a-input"
          />
          <input
            name="lng"
            type="number"
            step="any"
            defaultValue={place.lng ?? ""}
            placeholder="Longitude"
            className="a-input"
          />
        </div>
        <div className="a-row-2">
          <input
            name="rating"
            type="number"
            step="0.1"
            defaultValue={place.rating ?? ""}
            placeholder="Rating"
            className="a-input"
          />
          <input
            name="reviews"
            type="number"
            defaultValue={place.reviews ?? ""}
            placeholder="Review count"
            className="a-input"
          />
        </div>
        <input name="price" defaultValue={place.price ?? ""} placeholder="Price (e.g. $$)" className="a-input" />
        <input
          name="venueId"
          defaultValue={place.venueId ?? ""}
          placeholder="Linked venue ID (optional)"
          className="a-input"
        />
        <label className="a-checkbox-row">
          <input type="checkbox" name="regional" defaultChecked={Boolean(place.regional)} /> Regional / outside city core
        </label>
        <label className="a-checkbox-row">
          <input type="checkbox" name="verified" defaultChecked={Boolean(place.verified)} /> Verified (shows on public map)
        </label>
        <p className="a-muted" style={{ fontSize: 12 }}>
          Source: {place.source}
        </p>
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
