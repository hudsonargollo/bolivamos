import { createDb, users } from "@bolivamos/db";
import { eq } from "drizzle-orm";
import { cf } from "@/lib/cloudflare";
import { createVenue } from "../../actions/venues";

const CATEGORIES = ["music", "nightlife", "gastronomy", "historical", "cultural"] as const;

export default async function NewVenuePage() {
  const { env } = cf();
  const db = createDb(env.DB);
  const hosts = await db.select().from(users).where(eq(users.role, "host"));

  return (
    <div>
      <h1 className="a-h1">New venue</h1>
      <form action={createVenue} className="a-form a-card">
        <input name="name" placeholder="Venue name" required className="a-input" />
        <select name="category" required className="a-select">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input name="address" placeholder="Address" className="a-input" />
        <div className="a-row-2">
          <input name="latitude" type="number" step="any" placeholder="Latitude" className="a-input" />
          <input name="longitude" type="number" step="any" placeholder="Longitude" className="a-input" />
        </div>
        <select name="hostId" className="a-select">
          <option value="">No host assigned</option>
          {hosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.email}
            </option>
          ))}
        </select>
        <select name="tier" defaultValue="free" className="a-select">
          <option value="free">Free tier</option>
          <option value="premium">Premium (B2B SaaS)</option>
        </select>
        <label className="a-checkbox-row">
          <input type="checkbox" name="featured" /> Featured (priority placement)
        </label>
        <button type="submit" className="clay-btn" style={{ alignSelf: "flex-start" }}>
          Create venue
        </button>
      </form>
    </div>
  );
}
