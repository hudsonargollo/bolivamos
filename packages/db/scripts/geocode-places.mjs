#!/usr/bin/env node
// Phase 0 data pipeline (docs/themed-maps/PRD-themed-interactive-maps.md §8.1, §9).
//
// Reads docs/themed-maps/data/places.json, normalizes every category into a
// single `places` shape, geocodes each entry via Nominatim (OSM), assigns one
// of the 7 hero-scene districts by nearest-centroid, and writes:
//   - packages/db/seeds/places.sql        INSERT statements ready for
//                                          `wrangler d1 execute --file=...`
//   - packages/db/seeds/places-report.json  counts + the list of low-confidence
//                                          rows that need manual QA (PRD §8.1:
//                                          "flag confidence < high for manual
//                                          review")
//
// Respects Nominatim's usage policy (nominatim.org/release-docs/latest/api/):
// max 1 request/second, a real User-Agent, and checkpoints progress to
// places-checkpoint.json every 20 places so a network hiccup partway through
// doesn't lose the run — re-running resumes from the checkpoint.
//
// Run: node packages/db/scripts/geocode-places.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const DATA_PATH = path.join(ROOT, "docs/themed-maps/data/places.json");
const SEEDS_DIR = path.join(__dirname, "../seeds");
const CHECKPOINT_PATH = path.join(SEEDS_DIR, "places-checkpoint.json");
const SQL_OUT_PATH = path.join(SEEDS_DIR, "places.sql");
const REPORT_OUT_PATH = path.join(SEEDS_DIR, "places-report.json");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "BoliVamos-ThemedMaps/1.0 (+https://bolivamos.app; contact: hudson@tektone.com.br)";
const REQUEST_DELAY_MS = 1100; // Nominatim policy: max 1 req/sec.
const CITY_SUFFIX = "Santa Cruz de la Sierra, Bolivia";
const REGIONAL_RADIUS_KM = 20; // beyond this from every district centroid -> regional:true

// The hero scene's 7 camera stops (PRD §7.4) — geocoded once, used as
// nearest-centroid targets for district assignment.
// Query strings verified against live Nominatim on 2026-08-23 — all 7 resolve.
const DISTRICTS = [
  { key: "Zoo", query: "Zoológico Municipal, Santa Cruz de la Sierra, Bolivia" },
  { key: "Parque Urbano", query: "Parque Urbano, Santa Cruz de la Sierra, Bolivia" },
  { key: "La Ramada", query: "Mercado La Ramada, Santa Cruz de la Sierra, Bolivia" },
  { key: "Centro", query: "Plaza 24 de Septiembre, Santa Cruz de la Sierra, Bolivia" },
  { key: "Reloj & Clima", query: "Catedral Metropolitana, Santa Cruz de la Sierra, Bolivia" },
  { key: "Equipetrol", query: "Equipetrol, Santa Cruz de la Sierra, Bolivia" },
  { key: "Las Brisas", query: "Las Brisas, Santa Cruz de la Sierra, Bolivia" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

async function geocode(query) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "es");

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Nominatim ${res.status} for "${query}"`);
  const results = await res.json();
  if (!results.length) return null;
  const r = results[0];
  return {
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
    importance: r.importance ?? 0,
  };
}

function normalizePlaces(data) {
  const out = [];

  for (const a of data.attractions) {
    out.push({
      id: a.id,
      name: a.name,
      layer: "attraction",
      category: a.group ?? a.type ?? null,
      rating: a.rating ?? null,
      reviews: a.reviews ?? null,
      price: null,
      source: "tripadvisor",
    });
  }
  for (const t of data.tours) {
    out.push({
      id: t.id,
      name: t.name,
      layer: "tour",
      category: t.group ?? t.type ?? null,
      rating: t.rating ?? null,
      reviews: t.reviews ?? null,
      price: null,
      source: "tripadvisor",
    });
  }
  for (const t of data.transfers) {
    out.push({
      id: t.id,
      name: t.name,
      layer: "transfer",
      category: t.group ?? null,
      rating: t.rating ?? null,
      reviews: t.reviews ?? null,
      price: null,
      source: "tripadvisor",
    });
  }
  for (const r of data.restaurants) {
    out.push({
      id: r.id,
      name: r.name,
      layer: "eat_drink",
      category: Array.isArray(r.cuisine) ? r.cuisine.join(", ") : (r.cuisine ?? null),
      rating: r.rating ?? null,
      reviews: r.reviews ?? null,
      price: r.price ?? null,
      source: "tripadvisor",
    });
  }
  const streetGroups = {
    avenidas: "Avenue",
    calles: "Street",
    pasajes_pedestrian: "Pedestrian passage",
    roundabouts: "Roundabout",
    areas: "Area",
  };
  for (const [group, category] of Object.entries(streetGroups)) {
    for (const name of data.streets[group] ?? []) {
      out.push({
        id: slugify(name),
        name,
        layer: "street_zone",
        category,
        rating: null,
        reviews: null,
        price: null,
        source: "openalfa",
      });
    }
  }

  return out;
}

function sqlString(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  console.log("Reading places.json...");
  const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const places = normalizePlaces(data);
  console.log(`Normalized ${places.length} places across ${new Set(places.map((p) => p.layer)).size} layers.`);

  console.log("Geocoding district reference points...");
  const districtCenters = [];
  for (const d of DISTRICTS) {
    const g = await geocode(d.query);
    if (!g) {
      console.warn(`  ! Could not geocode district "${d.key}" (${d.query}) — it will get no places assigned.`);
      continue;
    }
    districtCenters.push({ key: d.key, lat: g.lat, lng: g.lng });
    console.log(`  ${d.key}: ${g.lat.toFixed(5)}, ${g.lng.toFixed(5)}`);
    await sleep(REQUEST_DELAY_MS);
  }

  let checkpoint = { results: {} };
  if (existsSync(CHECKPOINT_PATH)) {
    checkpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, "utf8"));
    console.log(`Resuming from checkpoint: ${Object.keys(checkpoint.results).length} places already geocoded.`);
  }

  let count = 0;
  for (const place of places) {
    if (checkpoint.results[place.id]) {
      continue; // already geocoded in a prior run
    }
    count++;
    try {
      const g = await geocode(`${place.name}, ${CITY_SUFFIX}`);
      if (!g) {
        checkpoint.results[place.id] = { lat: null, lng: null, district: null, regional: false, verified: false, reason: "no-match" };
      } else {
        let district = null;
        let regional = false;
        if (districtCenters.length > 0) {
          let nearest = districtCenters[0];
          let nearestDist = haversineKm(g.lat, g.lng, nearest.lat, nearest.lng);
          for (const d of districtCenters.slice(1)) {
            const dist = haversineKm(g.lat, g.lng, d.lat, d.lng);
            if (dist < nearestDist) {
              nearest = d;
              nearestDist = dist;
            }
          }
          if (nearestDist > REGIONAL_RADIUS_KM) {
            regional = true;
          } else {
            district = nearest.key;
          }
        }
        // Nominatim's `importance` is global significance (Wikipedia-derived), not match
        // confidence — a correctly-matched small restaurant can score 0.01. A far better
        // signal: does the result's display_name actually land in Bolivia at all (rules out
        // Nominatim matching a same-named place in a different country entirely). Distance
        // from Centro is NOT part of this check — legitimately distant POIs (national parks,
        // Samaipata) can still be a correct, verified match; they just also get regional:true.
        const verified = /Bolivia/i.test(g.displayName ?? "");
        checkpoint.results[place.id] = {
          lat: g.lat,
          lng: g.lng,
          district,
          regional,
          verified,
          displayName: g.displayName,
          importance: g.importance,
        };
      }
    } catch (err) {
      console.warn(`  ! Failed to geocode "${place.name}": ${err.message}`);
      checkpoint.results[place.id] = { lat: null, lng: null, district: null, regional: false, verified: false, reason: String(err.message) };
    }

    if (count % 20 === 0) {
      writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
      console.log(`  ...${count}/${places.length - Object.keys(checkpoint.results).length + count} geocoded this run, checkpoint saved.`);
    }
    await sleep(REQUEST_DELAY_MS);
  }
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
  console.log(`Geocoding pass complete. ${Object.keys(checkpoint.results).length}/${places.length} total resolved (this run + prior checkpoints).`);

  // --- Emit SQL + report ---
  const sqlLines = [
    "-- Generated by packages/db/scripts/geocode-places.mjs — do not hand-edit.",
    "-- Re-run the script and re-apply this file to refresh geocoding.",
  ];
  const needsReview = [];
  let verifiedCount = 0;

  for (const place of places) {
    const g = checkpoint.results[place.id] ?? { lat: null, lng: null, district: null, regional: false, verified: false };
    if (g.verified) verifiedCount++;
    else if (!place.id.startsWith("_district")) needsReview.push({ id: place.id, name: place.name, layer: place.layer, reason: g.reason ?? "low-confidence", displayName: g.displayName });

    const cols = ["id", "name", "layer", "category", "district", "lat", "lng", "rating", "reviews", "price", "regional", "source", "verified"];
    const vals = [
      place.id,
      place.name,
      place.layer,
      place.category,
      g.district,
      g.lat,
      g.lng,
      place.rating,
      place.reviews,
      place.price,
      g.regional,
      place.source,
      g.verified,
    ];
    sqlLines.push(
      `INSERT INTO places (${cols.join(", ")}) VALUES (${vals.map(sqlString).join(", ")}) ON CONFLICT(id) DO UPDATE SET ` +
        cols
          .slice(1)
          .map((c) => `${c}=excluded.${c}`)
          .join(", ") +
        ";",
    );
  }

  writeFileSync(SQL_OUT_PATH, sqlLines.join("\n") + "\n");
  writeFileSync(
    REPORT_OUT_PATH,
    JSON.stringify(
      {
        total: places.length,
        verified: verifiedCount,
        verifiedPct: Math.round((verifiedCount / places.length) * 1000) / 10,
        needsReviewCount: needsReview.length,
        needsReview,
      },
      null,
      2,
    ),
  );

  console.log(`\nWrote ${SQL_OUT_PATH}`);
  console.log(`Wrote ${REPORT_OUT_PATH}`);
  console.log(`Verified: ${verifiedCount}/${places.length} (${Math.round((verifiedCount / places.length) * 1000) / 10}%) — PRD exit criteria is >=95% of non-regional places.`);
  console.log(`Needs manual QA: ${needsReview.length} places.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
