-- SEO-friendly URL slugs for public event/venue detail pages
-- (apps/web/app/[locale]/santa-cruz-de-la-sierra/{eventos,lugares}/[slug]).
-- Nullable until the backfill script (packages/db/scripts/backfill-seo-slugs.mjs)
-- runs against existing rows; new rows get one at create time
-- (packages/db/src/slug.ts's generateUniqueSlug). Partial unique indexes so
-- pre-backfill NULL rows don't collide with each other.
ALTER TABLE events ADD COLUMN slug TEXT;
ALTER TABLE venues ADD COLUMN slug TEXT;

CREATE UNIQUE INDEX events_slug_idx ON events(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX venues_slug_idx ON venues(slug) WHERE slug IS NOT NULL;
