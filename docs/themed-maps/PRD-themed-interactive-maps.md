# PRD — BoliVamos Themed Interactive Maps (mapz.com integration)

| | |
|---|---|
| **Product** | BoliVamos (`apps/web` + `apps/mobile`) |
| **Feature** | Themed interactive city maps of Santa Cruz de la Sierra |
| **Author** | Hudson Argollo (drafted with Claude) |
| **Date** | 2026-08-23 |
| **Status** | Draft v1 |
| **Companion data** | `data/santa-cruz-directory.md`, `data/places.json` (530 entries), `data/places.sample.geojson` |

---

## 1. Summary

BoliVamos' hero scene is a claymation three.js diorama of Santa Cruz: a fixed-orientation camera that pans horizontally between districts, clay-pill chips that "travel" the camera to a zone, an info popup anchored in 3D space, and bottom sheets for content. It sells the brand, but it is an illustration — it cannot answer "where actually is this restaurant?" or "what's near me?".

This feature adds real, navigable maps powered by the **mapz.com API** (an OpenLayers-based tile + overlay service on OpenStreetMap data), themed so they read as the 2D sibling of the hero scene — same clay palette, same typography, same chip-and-sheet navigation — and populated with the curated Santa Cruz directory we scraped (30 attractions, 21 tours & transfers, 359 restaurants, 120 named streets of the casco viejo). Those specific places are the launch scope.

## 2. Goals

The map must feel like BoliVamos, not like an embedded Google Map: warm cream ground, clay markers, Caprasimo headings, clay-pill district chips, bottom-sheet place details. It must put the whole curated directory on the map in useful category layers, connect places to the existing events/venues system (a venue pin opens its upcoming events), work in both apps (web route first, mobile via WebView), stay bilingual EN/ES, and respect mapz + OpenStreetMap attribution. Success at launch: a tourist can open Places, see the clay map of the Centro, tap a district chip to fly there, tap a marker, and get a place sheet with rating, category, and a route hint — in under 3 seconds on 4G.

## 3. Non-goals (v1)

Turn-by-turn navigation; offline tiles; user-generated pins or reviews; indoor maps; re-modeling the 3D hero (it stays as-is — the 2D map is a sibling surface, not a replacement); covering places outside the curated directory; live transit data.

## 4. Users & primary use cases

**Visitors/tourists (mobile-first).** "What's around Plaza 24 de Septiembre?" → open map on Centro, browse attraction + restaurant layers, tap → place sheet → save/share. "Take me somewhere for dinner in Equipetrol" → Eat & Drink layer filtered by district chip.

**Locals planning a night out (web + mobile).** Cross-link from an event page: "Beele Live at Estadio Real Santa Cruz" → map pin of the venue → what's nearby before/after.

**Hosts (web Host Portal).** When creating an event or venue, drop/adjust the venue pin on the themed map instead of typing raw coordinates.

## 5. Current state (what we build on)

- `apps/web` — Next.js 15 App Router on Cloudflare Workers (OpenNext), D1 (Drizzle) with `events`/`venues`, KV, Zod contracts in `packages/api-schema`.
- `apps/mobile` — Expo Router (RN 0.76.9, NativeWind); tabs: Home, BoliPass, Companion, Profile.
- Hero scene — `apps/web/public/bolivamos/scene.js` (+ `three-d-stage.js`, `bottom-sheet.js`, `page-ui.js`), `app/bolivamos-scene.css`. Its district navigation model and visual tokens are the spec for the map's chrome (see §7).
- Curated data — this package's `places.json`: attractions, tours, transfers, restaurants (TripAdvisor-sourced), streets (OpenAlfa/OSM). **No coordinates yet** — geocoding is Phase 0 (§9).

## 6. The mapz.com API — what we're integrating

Facts verified against mapz.com on 2026-08-23:

- **Library:** a custom OpenLayers build served by mapz:
  `https://www.mapz.com/api/static/css/ol/7.3.0/ol.css` and `https://www.mapz.com/api/static/javascript/lib/7.3.0/ol.js` (adds `ol.mapz.*` helpers on top of standard OpenLayers).
- **Raster tile endpoint (XYZ, EPSG:3857, note the `{-y}` TMS row):**
  `https://tiles.mapz.com/mapproxy/v1/{API_KEY}/tiles/1.0.0/{STYLE}/EPSG3857/{z}/{x}/{-y}.{jpeg|png}`
- **Styles:** named base designs, e.g. `mapz_multicolor`, `mapz_shades_of_gray` (each also as `_hq` high-quality variant, and with/without labels). The full style catalog and whether mapz will produce a **custom BoliVamos design** is Open Question OQ-1.
- **Overlay features (from mapz's own examples):** markers with popup (sticky and click), marker **clustering** (+ expand), **GeoJSON** loading and styling (`ol.mapz.style.MapzStyle`, `baseIconUrl: https://www.mapz.com/map/marker/svg/`), route plotting, **geolocate/geotracker**, **search within a GeoJSON file**, layer switcher, zoom restriction, static/dynamic attribution controls. A separate **Print API** exists for print-resolution exports.
- **Auth:** the API key is embedded in the tile URL. Demo keys via `demo.api.key@mapz.com`; permanent keys with a plan.
- **Pricing (API/WMS/TMS):** €60/month for up to 250,000 map impressions (512×512), then €0.10 per 1,000; no minimum term, monthly cancellation; >10M impressions by custom quote.
- **Attribution:** online maps must credit and link mapz.com plus "Map Data: OpenStreetMap (ODbL)". Keep the attribution control visible.

**Consequence of raster tiles:** mapz serves pre-styled raster tiles, so we cannot restyle roads/water/land at the tile level the way vector styles allow. The clay look is achieved by (a) choosing the most neutral base style, (b) a tuned CSS filter on the tile layer, and (c) putting all brand color into overlays, markers, and chrome — detailed in §7. If mapz offers a custom raster design (OQ-1), the filter becomes unnecessary.

## 7. Design specification — "the hero scene, flattened"

### 7.1 Design tokens (extracted from the shipped hero scene)

Single source of truth for map chrome; add these to `packages/design-tokens` as a `map` namespace.

| Token | Value | From |
|---|---|---|
| `map.bg.cream` | `#f5ead8` | page/hero background |
| `map.bg.dark` | `#201e1d` | dark sections |
| `map.clay.charcoal` | `#33302c` | scene.js `clay-charcoal` |
| `map.clay.red` | `#c04a2f` | `clay-red` |
| `map.clay.orange` | `#e2792f` | `clay-orange` |
| `map.clay.yellow` | `#e3a52f` | `clay-yellow` |
| `map.clay.sage` | `#8ba672` | `clay-green` |
| `map.clay.terracotta` | `#c4703d` | `clay-terracotta` / CTA buttons |
| `map.clay.roof` | `#b0532f` | `clay-roof` / link color |
| `map.clay.cream` | `#efe4d2` | `clay-cream` |
| `map.clay.sand` | `#dccbaa` | `clay-sand` |
| `map.clay.ground` | `#e6d7bd` | `clay-ground` (plaza) |
| `map.clay.water` | `#7fa3a0` | `clay-agua` (Arenal lagoon) |
| `map.clay.pink` | `#d98f9c` | `clay-toborochi` |
| `map.shadow.press` | `#8e4a20` | clay-btn hard shadow |
| `map.font.display` | Caprasimo | section headings |
| `map.font.wordmark` | Archivo Black | wordmark |
| `map.font.body` | Figtree 600/700 | UI text |

(The BRANDGUIDE core tokens — Bebas Neue/Inter, `#E07A2A` etc. — remain the print/brand palette; the hero scene tokens above are the product-surface palette and win on the map.)

### 7.2 Base map treatment

Base layer: `mapz_shades_of_gray_hq` (least opinionated color, keeps label legibility), warmed to clay with a CSS filter on the OpenLayers tile layer element:

```css
/* start point — tune by eye against the hero, then freeze */
.bv-map .ol-layer:first-child canvas {
  filter: sepia(.55) saturate(.9) hue-rotate(-8deg) brightness(1.04) contrast(.96);
}
.bv-map { background: #e6d7bd; } /* clay ground shows while tiles load */
```

Acceptance for the treatment: land reads in the `#e6d7bd`–`#efe4d2` range, water sits near `#7fa3a0`, no pure grays or blues survive, labels stay ≥ 4.5:1 contrast. If OQ-1 lands a custom mapz design, drop the filter and pin the delivered style name.

### 7.3 Markers, clusters, popups

Clay markers, not mapz defaults: rounded-square SVG "clay chips" with the pressed-clay shadow (2px hard offset in `map.shadow.press` tones), one color per category — attractions terracotta `#c4703d`, eat & drink red `#c04a2f`, tours & transfers sage `#8ba672`, nightlife charcoal `#33302c`, shopping yellow `#e3a52f`, parks/nature deep sage `#5c7245`, streets/zones sand `#b99a55`. Icon glyphs: simple white silhouettes (fork, sun-mark rays for attractions, bus, moon, bag, leaf). Selected marker scales 1.15× with a warm halo (`rgba(255,214,150,.85)` radial — same ramp as the hero's sun halo). Clusters: clay circle in category color with Figtree 700 count, expanding on tap (mapz `cluster_expand` pattern). Popups are not used on mobile — tapping opens the **bottom sheet** (§7.5); on web desktop a compact sticky popup (cream card, 12px radius, clay border `#c4703d`) may show name + rating with "Ver más" opening the sheet.

### 7.4 District chips — the hero's navigation, reused verbatim

The hero defines seven camera stops; the map reuses the same names, order, and dot colors as `fitBounds` targets:

| Chip | Hero dot | Map behavior (v1 bounds TBD in geocoding pass) |
|---|---|---|
| Zoo | `#7a8a5e` | Zoológico Municipal + 3er anillo NW |
| Parque Urbano | `#5c7245` | Parque Urbano Central |
| La Ramada | `#c04a2f` | Mercado La Ramada quarter |
| Centro | `#33302c` | Casco viejo — Plaza 24 de Septiembre (default view) |
| Reloj & Clima | `#c4703d` | Plaza + cathedral clock block |
| Equipetrol | `#8ba672` | Equipetrol / Sirari nightlife & dining |
| Las Brisas | `#b99a55` | Las Brisas mall quarter |

Chips render exactly like the hero's `.metro-stop` buttons (dot + Figtree label, active state) in a horizontally scrollable clay tray over the map. Category layer toggles use `.clay-btn` styling (terracotta primary, sage/charcoal variants). The map animates `view.fit()` at 600ms ease — the 2D equivalent of the hero's camera pan; **no rotation**, matching the hero's "camera never rotates" rule.

### 7.5 Place sheet

Reuse `bottom-sheet.js` behavior (handle, drag, backdrop) and the hero's sheet styling. Content order: name (Caprasimo 28), category + district (Figtree 600, `#7a6a52`), rating as clay-sun glyphs (0–5, terracotta fill) + review count, price tier, action row of clay buttons — "Cómo llegar" (opens route line via mapz route example, or deep-links external nav), "Eventos aquí" (if the place matches a `venues` row), "Compartir". Attribution footer inside the sheet is not required; map attribution stays on-map.

### 7.6 Bilingual

All chrome strings go through the existing `data-i18n` dictionary (EN/ES). Place names stay in Spanish (canonical); categories translate.

## 8. Data & architecture

### 8.1 Pipeline (Phase 0)

```
places.json ──geocode──▶ places table (D1) ──build──▶ /api/places?layer=…&district=…
   │                        ▲ manual QA pass                (GeoJSON FeatureCollection)
   └── streets[] ──────────▶ search index (client-side, mapz search_in_file pattern)
```

Geocoding: batch through **Nominatim/Photon (OSM)** with `q="{name}, Santa Cruz de la Sierra, Bolivia"`, rate-limited, cached; flag `confidence < high` for manual review in a one-off Host-Portal QA screen (drag pin to correct — writes back to D1). TripAdvisor pages must not be re-scraped for coordinates (ToS); OSM is the coordinate source. Expect ~15% manual fixes; budget one evening of qa. Distant POIs (Samaipata, La Higuera, national parks) get a `regional: true` flag and appear only at low zoom.

### 8.2 D1 schema (Drizzle, `packages/db`)

```ts
export const places = sqliteTable('places', {
  id: text('id').primaryKey(),            // slug from places.json
  name: text('name').notNull(),
  layer: text('layer').notNull(),         // attraction | eat_drink | tour | transfer | street_zone
  category: text('category'),             // display subcategory
  district: text('district'),             // one of the 7 chips, nullable for regional
  lat: real('lat'), lng: real('lng'),
  rating: real('rating'), reviews: integer('reviews'),
  price: text('price'),
  regional: integer('regional', { mode: 'boolean' }).default(false),
  venueId: text('venue_id').references(() => venues.id), // link into events system
  source: text('source').notNull(),       // 'tripadvisor' | 'openalfa' | 'manual'
  verified: integer('verified', { mode: 'boolean' }).default(false),
});
```

`GET /api/places` (new route in `apps/web/app/api/places/route.ts`, Zod contract in `packages/api-schema`) returns a GeoJSON FeatureCollection filtered by `layer`/`district`/`bbox`, cached at the edge (`Cache-Control: s-maxage=3600`), only `verified` rows in production.

### 8.3 Map page & key security

New route `apps/web/app/map/page.tsx` (client component) loading the mapz OL build. **The mapz key never ships raw:** tiles are proxied through the Worker —

```
/api/tiles/{style}/{z}/{x}/{y}.jpeg  →  Worker fetch →
https://tiles.mapz.com/mapproxy/v1/{MAPZ_API_KEY}/tiles/1.0.0/{style}/EPSG3857/{z}/{x}/{-y}.jpeg
```

with `MAPZ_API_KEY` as a Wrangler secret, the Cloudflare Cache API caching tiles at the edge (cuts billable mapz impressions substantially), a same-origin/Referer check, and the `{-y}` TMS flip handled in the proxy so the client uses plain XYZ. Rate-limit per IP at the proxy. This also future-proofs a swap to any other tile vendor without touching clients.

Init sketch:

```js
const base = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: '/api/tiles/mapz_shades_of_gray_hq/{z}/{x}/{y}.jpeg',
    attributions: ['© <a href="https://www.mapz.com">mapz.com</a> — Map Data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (ODbL)'],
  }),
});
const view = new ol.View({
  center: ol.proj.fromLonLat([-63.1821, -17.7834]), // Plaza 24 de Septiembre
  zoom: 15, minZoom: 11, maxZoom: 19,               // restrict_zoom pattern
});
```

### 8.4 Mobile

v1: a `map` screen in `apps/mobile` rendering the web map via `react-native-webview` (new dependency) pointing at `/map?embed=1&lang=es` — the embed flag hides the web header and enables `postMessage` bridging (place-sheet taps forward to native share/deep-links). Native geolocation permission feeds the map's "you are here" clay marker through the bridge. A native MapLibre rewrite is explicitly deferred (see §12).

### 8.5 Hero scene hook

The hero's "Places" tab and the info-popup's "Tap a zone to travel" gain a second action: "Abrir mapa real" → `/map?district={active}` — carrying the active district chip across surfaces so the transition feels continuous.

## 9. Rollout plan

| Phase | Scope | Exit criteria |
|---|---|---|
| **P0 — Data** (wk 1) | Geocode `places.json` → D1; QA pins; district assignment; `/api/places` | ≥95% of non-regional places verified on map |
| **P1 — Web MVP** (wk 2–3) | `/map` route, tile proxy, base treatment, markers + clusters, district chips, place sheet, EN/ES | Usable on mobile web; Lighthouse perf ≥ 80 |
| **P2 — Theme polish** (wk 3–4) | Filter tuning vs hero, halo selection states, search over places + streets, geolocate | Side-by-side screenshot review approved |
| **P3 — Mobile embed** (wk 4–5) | WebView screen, bridge, native share/nav deep-links | Ships in Expo build behind flag |
| **P4 — Connections** (wk 6) | venue↔place linking, event pages "ver en mapa", Host Portal pin editor, tour route lines | An event → map → nearby dinner flow works end-to-end |

## 10. Metrics

Map opens per session; marker taps per map open (target ≥ 2); district chip usage; place-sheet → event page click-through; share actions; mapz impressions per month vs 250k plan ceiling (proxy cache hit-rate target ≥ 60%); p75 time-to-interactive of `/map` on 4G ≤ 3s.

## 11. Open questions

**OQ-1:** Can mapz deliver a custom raster design matching the clay palette (§7.2), and at what cost? (Contact via their form; they advertise "Choose a map design" + custom work for tourism.) **OQ-2:** Style catalog — confirm exact names/labels variants available on our key beyond `mapz_multicolor` / `mapz_shades_of_gray`. **OQ-3:** Does the mapz license permit tile delivery through our caching proxy? (Their tariff sells "map impressions"; confirm the proxy + edge-cache model is compliant before P1 ends — if not, fall back to direct tile URLs with a domain-restricted key and revisit costs.) **OQ-4:** TripAdvisor ratings/review counts in-app: product wants them on the sheet; legal review of TripAdvisor content terms pending — the schema keeps `rating`/`reviews` nullable so we can ship names/categories only if required. **OQ-5:** Demo key first or straight to the €60 Standard plan for the P1 build?

## 12. Risks & mitigations

**Raster restyle ceiling** — a CSS filter can't recolor selectively; if the warmed tiles clash with the clay chrome, escalate OQ-1 (custom design) or accept the neutral base and let overlays carry the brand. Worst case, the architecture (tile proxy + OpenLayers + GeoJSON overlays) ports to a MapLibre/OpenFreeMap vector stack with a hand-built clay style — a swap contained in the base-layer module, kept as the documented plan B. **Geocoding accuracy** — mitigated by the QA pin editor and `verified` gating. **mapz availability/SLA** — proxy cache serves stale tiles on origin failure (`stale-while-revalidate`). **Key abuse** — proxy + referer check + rate limit (§8.3). **WebView UX on low-end Android** — restrict zoom range, jpeg tiles, cluster aggressively below z14; if still poor, cut P3 to an in-app browser link until the native rewrite. **Data licensing** — OQ-3/OQ-4; OSM ODbL attribution always on.

## 13. Acceptance criteria (v1 launch)

A reviewer comparing the hero scene and `/map` side-by-side identifies them as one product family without being told. All 7 district chips fly correctly; every verified place appears in exactly one layer with the right marker color; clusters expand; the place sheet shows name/category/district/rating(if cleared)/actions in both languages; attribution for mapz + OSM is visible; the mapz key appears nowhere in client bundles or network panel; tile proxy cache hit-rate ≥ 60% after one week; `/api/places` p95 < 200ms at the edge.

---

*Package contents: this PRD; `data/santa-cruz-directory.md` (human-readable directory); `data/places.json` (machine-readable, geocoding-ready); `data/places.sample.geojson` (≈10 seed POIs with approximate coordinates, `verified:false`, for dev bootstrapping before P0 completes).*
