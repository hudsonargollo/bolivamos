-- Adds coordinates to events so the themed map (apps/web/public/bolivamos/city-scene.js)
-- can place real event markers alongside places. Events have no venue row
-- (venue_id is null for all 59 current rows — they're imported/aggregated
-- listings, not host-created), so there's no venues.latitude/longitude to
-- join against; these are geocoded directly from venue_name via
-- packages/db/scripts/geocode-events.mjs, same Nominatim pipeline as places.
ALTER TABLE events ADD COLUMN lat REAL;
ALTER TABLE events ADD COLUMN lng REAL;
