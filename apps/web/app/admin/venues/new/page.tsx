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
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl uppercase">New venue</h1>
      <form action={createVenue} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <input name="name" placeholder="Venue name" required className="w-full rounded-md border p-2" />
        <select name="category" required className="w-full rounded-md border p-2">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input name="address" placeholder="Address" className="w-full rounded-md border p-2" />
        <div className="flex gap-3">
          <input name="latitude" type="number" step="any" placeholder="Latitude" className="w-full rounded-md border p-2" />
          <input name="longitude" type="number" step="any" placeholder="Longitude" className="w-full rounded-md border p-2" />
        </div>
        <select name="hostId" className="w-full rounded-md border p-2">
          <option value="">No host assigned</option>
          {hosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.email}
            </option>
          ))}
        </select>
        <select name="tier" defaultValue="free" className="w-full rounded-md border p-2">
          <option value="free">Free tier</option>
          <option value="premium">Premium (B2B SaaS)</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" /> Featured (priority placement)
        </label>
        <button type="submit" className="rounded-pill bg-boli-green px-5 py-2 text-white">
          Create venue
        </button>
      </form>
    </div>
  );
}
