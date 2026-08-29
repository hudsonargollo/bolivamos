import { notFound } from "next/navigation";
import { createDb, users, venues } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";
import { updateVenue, deleteVenue } from "../../actions/venues";

const CATEGORIES = ["music", "nightlife", "gastronomy", "historical", "cultural"] as const;

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { env } = cf();
  const db = createDb(env.DB);

  const [venue] = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
  if (!venue) notFound();

  const hosts = await db.select().from(users).where(eq(users.role, "host"));

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">Edit venue</h1>
      <form action={updateVenue} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <input type="hidden" name="id" value={venue.id} />
        <input name="name" defaultValue={venue.name} required className="w-full rounded-md border p-2" />
        <select name="category" defaultValue={venue.category} required className="w-full rounded-md border p-2">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="address"
          defaultValue={venue.address ?? ""}
          placeholder="Address"
          className="w-full rounded-md border p-2"
        />
        <div className="flex gap-3">
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={venue.latitude ?? ""}
            placeholder="Latitude"
            className="w-full rounded-md border p-2"
          />
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={venue.longitude ?? ""}
            placeholder="Longitude"
            className="w-full rounded-md border p-2"
          />
        </div>
        <select name="hostId" defaultValue={venue.hostId ?? ""} className="w-full rounded-md border p-2">
          <option value="">No host assigned</option>
          {hosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.email}
            </option>
          ))}
        </select>
        <select name="tier" defaultValue={venue.tier ?? "free"} className="w-full rounded-md border p-2">
          <option value="free">Free tier</option>
          <option value="premium">Premium (B2B SaaS)</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={Boolean(venue.featured)} /> Featured (priority placement)
        </label>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Save changes
        </button>
      </form>

      <form action={deleteVenue}>
        <input type="hidden" name="id" value={venue.id} />
        <button type="submit" className="rounded-pill bg-boli-red px-5 py-2 text-white">
          Delete venue
        </button>
      </form>
    </div>
  );
}
