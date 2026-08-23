-- Adds public-listing fields to events so imported/aggregated events (no
-- BoliPass host, no venue row) can carry their own location and category
-- info directly, alongside host-created events which leave these null.
ALTER TABLE events ADD COLUMN category TEXT;
ALTER TABLE events ADD COLUMN price_text TEXT;
ALTER TABLE events ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN venue_name TEXT;
ALTER TABLE events ADD COLUMN district TEXT;
ALTER TABLE events ADD COLUMN maps_url TEXT;
-- Internal de-dupe key for re-running the import; never surfaced as a link.
-- SQLite can't ADD COLUMN ... UNIQUE directly, so the constraint is a separate index.
ALTER TABLE events ADD COLUMN source_slug TEXT;
CREATE UNIQUE INDEX idx_events_source_slug ON events(source_slug);
