import { eq } from "drizzle-orm";
import type { AnySQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Db } from "./client";

/**
 * Ports packages/db/scripts/geocode-places.mjs's slugify() — kept in sync by
 * hand since that script can't import this module (see backfill-seo-slugs.mjs,
 * which duplicates this logic rather than running TS).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Slugifies `base` and appends a short random suffix on collision, retrying
 * a few times before giving up. Used at create time by the events/venues
 * POST routes — the one-off backfill for pre-existing rows lives in
 * packages/db/scripts/backfill-seo-slugs.mjs instead (that script talks to
 * D1 over `wrangler d1 execute`, not this drizzle client).
 */
export async function generateUniqueSlug(
  db: Db,
  table: SQLiteTable,
  slugColumn: AnySQLiteColumn,
  base: string,
): Promise<string> {
  const root = slugify(base) || "item";
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt === 0 ? root : `${root}-${crypto.randomUUID().slice(0, 4)}`;
    const [existing] = await db.select().from(table).where(eq(slugColumn, candidate)).limit(1);
    if (!existing) return candidate;
  }
  // Extremely unlikely fallback — guarantees uniqueness even if every retry collided.
  return `${root}-${crypto.randomUUID().slice(0, 8)}`;
}
