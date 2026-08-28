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
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">Edit place</h1>
      <form action={updatePlace} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={place.id} />
        <input name="name" defaultValue={place.name} required className="w-full rounded-md border p-2" />
        <select name="layer" defaultValue={place.layer} required className="w-full rounded-md border p-2">
          {LAYERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input name="category" defaultValue={place.category ?? ""} placeholder="Category" className="w-full rounded-md border p-2" />
        <input
          name="district"
          defaultValue={place.district ?? ""}
          placeholder="District"
          className="w-full rounded-md border p-2"
        />
        <div className="flex gap-3">
          <input
            name="lat"
            type="number"
            step="any"
            defaultValue={place.lat ?? ""}
            placeholder="Latitude"
            className="w-full rounded-md border p-2"
          />
          <input
            name="lng"
            type="number"
            step="any"
            defaultValue={place.lng ?? ""}
            placeholder="Longitude"
            className="w-full rounded-md border p-2"
          />
        </div>
        <div className="flex gap-3">
          <input
            name="rating"
            type="number"
            step="0.1"
            defaultValue={place.rating ?? ""}
            placeholder="Rating"
            className="w-full rounded-md border p-2"
          />
          <input
            name="reviews"
            type="number"
            defaultValue={place.reviews ?? ""}
            placeholder="Review count"
            className="w-full rounded-md border p-2"
          />
        </div>
        <input name="price" defaultValue={place.price ?? ""} placeholder="Price (e.g. $$)" className="w-full rounded-md border p-2" />
        <input
          name="venueId"
          defaultValue={place.venueId ?? ""}
          placeholder="Linked venue ID (optional)"
          className="w-full rounded-md border p-2"
        />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="regional" defaultChecked={Boolean(place.regional)} /> Regional / outside city core
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="verified" defaultChecked={Boolean(place.verified)} /> Verified (shows on public map)
        </label>
        <p className="text-xs text-muted-clay-gray">Source: {place.source}</p>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Save changes
        </button>
      </form>

      <form action={deletePlace}>
        <input type="hidden" name="id" value={place.id} />
        <button type="submit" className="rounded-pill bg-boli-red px-5 py-2 text-white">
          Delete place
        </button>
      </form>
    </div>
  );
}
