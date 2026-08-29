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
    <div>
      <h1 className="a-h1">Edit venue</h1>
      <form action={updateVenue} className="a-form a-card">
        <input type="hidden" name="id" value={venue.id} />
        <input name="name" defaultValue={venue.name} required className="a-input" />
        <select name="category" defaultValue={venue.category} required className="a-select">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input name="address" defaultValue={venue.address ?? ""} placeholder="Address" className="a-input" />
        <div className="a-row-2">
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={venue.latitude ?? ""}
            placeholder="Latitude"
            className="a-input"
          />
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={venue.longitude ?? ""}
            placeholder="Longitude"
            className="a-input"
          />
        </div>
        <select name="hostId" defaultValue={venue.hostId ?? ""} className="a-select">
          <option value="">No host assigned</option>
          {hosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.email}
            </option>
          ))}
        </select>
        <select name="tier" defaultValue={venue.tier ?? "free"} className="a-select">
          <option value="free">Free tier</option>
          <option value="premium">Premium (B2B SaaS)</option>
        </select>
        <label className="a-checkbox-row">
          <input type="checkbox" name="featured" defaultChecked={Boolean(venue.featured)} /> Featured (priority placement)
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Save changes
        </button>
      </form>

      <form action={deleteVenue} style={{ marginTop: 20 }}>
        <input type="hidden" name="id" value={venue.id} />
        <button type="submit" className="clay-btn clay-danger">
          Delete venue
        </button>
      </form>
    </div>
  );
}
