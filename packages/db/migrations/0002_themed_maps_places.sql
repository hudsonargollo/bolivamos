-- Themed Interactive Maps (docs/themed-maps/PRD-themed-interactive-maps.md §8.2).
-- Holds the curated Santa Cruz directory (attractions, restaurants, tours,
-- transfers, streets/zones) geocoded from docs/themed-maps/data/places.json.
-- lat/lng and verified start null/false; the geocoding script
-- (packages/db/scripts/geocode-places.ts) fills them in and QA flips verified.
CREATE TABLE places (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  layer TEXT NOT NULL,
  category TEXT,
  district TEXT,
  lat REAL,
  lng REAL,
  rating REAL,
  reviews INTEGER,
  price TEXT,
  regional INTEGER DEFAULT FALSE,
  venue_id TEXT REFERENCES venues(id),
  source TEXT NOT NULL,
  verified INTEGER DEFAULT FALSE
);

CREATE INDEX idx_places_layer ON places(layer);
CREATE INDEX idx_places_district ON places(district);
