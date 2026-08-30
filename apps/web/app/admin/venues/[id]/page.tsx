import { notFound } from "next/navigation";
import { createDb, users, venues } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
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
      <form action={updateVenue} className="a-form a-card" style={{ maxWidth: 520 }}>
        <input type="hidden" name="id" value={venue.id} />

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Basics</h2>
          <div className="a-field">
            <label htmlFor="name">Venue name</label>
            <input id="name" name="name" defaultValue={venue.name} required className="a-input" />
          </div>
          <div className="a-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={venue.category} required className="a-select">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ textTransform: "capitalize" }}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Location</h2>
          <div className="a-field">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" defaultValue={venue.address ?? ""} className="a-input" />
          </div>
          <div className="a-row-2">
            <div className="a-field">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={venue.latitude ?? ""}
                className="a-input"
              />
            </div>
            <div className="a-field">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={venue.longitude ?? ""}
                className="a-input"
              />
            </div>
          </div>
        </div>

        <div className="a-fieldset">
          <h2 className="a-fieldset-title">Ownership &amp; tier</h2>
          <div className="a-field">
            <label htmlFor="hostId">Host</label>
            <select id="hostId" name="hostId" defaultValue={venue.hostId ?? ""} className="a-select">
              <option value="">No host assigned</option>
              {hosts.map((host) => (
                <option key={host.id} value={host.id}>
                  {host.email}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <label htmlFor="tier">Tier</label>
            <select id="tier" name="tier" defaultValue={venue.tier ?? "free"} className="a-select">
              <option value="free">Free tier</option>
              <option value="premium">Premium (B2B SaaS)</option>
            </select>
          </div>
          <label className="a-checkbox-row">
            <input type="checkbox" name="featured" defaultChecked={Boolean(venue.featured)} /> Featured (priority placement)
          </label>
        </div>

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
