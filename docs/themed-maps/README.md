# BoliVamos — Themed Maps Package

Everything needed to kick off the mapz.com themed-maps integration for Santa Cruz de la Sierra.

| File | What it is |
|---|---|
| `PRD-themed-interactive-maps.md` | Product requirements: mapz.com API integration, clay theming spec (tokens extracted from the shipped hero scene), data pipeline, architecture, rollout phases, risks. |
| `data/santa-cruz-directory.md` | Human-readable directory: 30 attractions, 21 tours & transfers, 359 restaurants (TripAdvisor, 2026-08-23), 120 casco-viejo streets (OpenAlfa/OSM). |
| `data/places.json` | The same data machine-readable: 530 entries with ids, categories, ratings; `lat`/`lng` null pending the Phase 0 geocoding pass. |
| `data/places.sample.geojson` | ~10 seed POIs with **approximate** coordinates (`verified:false`) so the map can be developed before geocoding completes. Not for production. |

Start with the PRD's §9 rollout plan — Phase 0 (geocoding into D1) unblocks everything else.

Data sources: TripAdvisor (g297317) and bolivia-streets.openalfa.com (OpenStreetMap-derived). Check TripAdvisor content terms before shipping ratings/review counts in-app (PRD OQ-4); OSM data is ODbL.

## Phase 0 status (2026-08-23)

Done and live on `bolivamos-db` (remote): `places` table (migration `0002_themed_maps_places.sql`),
`GET /api/places` (GeoJSON FeatureCollection, `apps/web/app/api/places/route.ts`), and all 530 places
seeded via `packages/db/scripts/geocode-places.mjs` (Nominatim, rate-limited, checkpointed) +
`retry-failed-geocodes.mjs` (broader-query fallback pass) + `fix-district-assignment.mjs`
(nearest-centroid district assignment against the 7 hero-scene districts).

**276/530 (52%) verified**, well short of the PRD's ≥95% target — see
`packages/db/seeds/places-report.json` for the full `needsReview` list (this is the QA-pin-editor
backlog described in PRD §8.1/§9, just bigger than the PRD's own ~15% estimate). By layer:
streets 116/120 (97% — already past target), restaurants 143/359 (40% — the QA priority, both the
biggest category and lowest hit rate), attractions 17/30 (57%), tours/transfers 0/14+7 (**expected**
— these are bookable services, not fixed locations, and arguably shouldn't be map pins at all; worth
revisiting whether they belong in `places` vs. a separate non-map listing).

Not started: P1's actual `/map` page — blocked on a mapz.com API key (PRD OQ-5: demo key vs. paid
plan is still an open decision) plus the OpenLayers/Three.js frontend work itself.
