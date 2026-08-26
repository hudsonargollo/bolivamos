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

## Direction change from the PRD (2026-08-25/26)

P1 shipped, but not as the PRD specced it. Instead of the mapz.com/OpenLayers 2D map
(§6–§8.3), the team extended the existing three.js hero scene into a **free-roam first-person
3D city** — `apps/web/app/city3d/` (`city-host.tsx` + `public/bolivamos/city-scene.js`). No
mapz.com integration, no `/map` route, no OpenLayers exist anywhere in the codebase; this
sidesteps OQ-1/OQ-2/OQ-3/OQ-5 (mapz custom design, pricing, licensing) entirely. The PRD's
*functional* spec (§7.5 place sheet, §8.1 search, §8.5 hero↔map continuity) is still the active
target — `city-scene.js` implements it directly against those section numbers in its own
comments — just rendered as a walkable 3D space instead of 2D tiles. §6/§7.2/§8.3 (mapz API,
raster tile treatment, tile proxy) are superseded; treat the rest of this PRD (goals, data
pipeline, design tokens, P4 connections, metrics) as current.

Shipped since P1: place sheet (name/category/district/rating/price + actions), search over
places, category-filtered rendering (attractions/eat & drink/tours as buildings, events as
glowing markers), EN/ES via the shared `Explore the city` and `Places` entry points, and (as of
today) the §8.5 district deep-link — `/city3d?district={key}` spawns the camera at that
district's pillar, wired from the hero's "Abrir mapa real" link so it always carries whichever
zone is currently active.

Not done: **P4 venue↔place linking** — `places.venueId` and the place sheet's "Eventos aquí"
button are wired and waiting, but the `venues` table has 0 rows (hosts haven't created any yet
via the Host Portal), so there's nothing to link to. This is blocked on venue data existing, not
on any map code. Tour/transfer route lines (also P4) are unstarted.

Also not done: the Host Portal QA pin editor (§8.1/§9) — the actual bottleneck for closing the
Phase 0 gap below. Confirmed today: automated retry (broader query variants, same free Nominatim
source) resolved **0 of the 253** remaining unverified places — these are small local
businesses genuinely absent from OpenStreetMap's Bolivia coverage, not a query-phrasing problem.
Free/automated geocoding has hit its ceiling at 52%. Closing to the PRD's ≥95% target now needs
either (a) a paid geocoder with better POI coverage (Google Places, ~$5/1000 requests for
~250 remaining lookups), or (b) the manual QA pin editor, or realistically both — some of these
253 may not be geocodable by *any* automated service and need a human to drop the pin.
