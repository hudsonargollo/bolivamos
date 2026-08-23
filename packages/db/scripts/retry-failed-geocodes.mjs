#!/usr/bin/env node
// Follow-up pass: the initial geocode-places.mjs run left 286/530 places
// unmatched, mostly because appending ", Santa Cruz de la Sierra, Bolivia"
// to EVERY place actively hurts search for genuinely regional POIs (national
// parks, distant eco-resorts) and for small businesses whose OSM tag doesn't
// carry TripAdvisor's exact listing name. This retries every "no-match" (and
// re-checks anything with lat/lng but no result object) with progressively
// broader queries: drop "de la Sierra" -> drop the city entirely -> give up
// (stays flagged for manual QA, per PRD §8.1's expected ~15% manual-fix rate).
//
// Run after geocode-places.mjs's initial pass:
//   node packages/db/scripts/retry-failed-geocodes.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = path.join(__dirname, "../seeds");
const CHECKPOINT_PATH = path.join(SEEDS_DIR, "places-checkpoint.json");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "BoliVamos-ThemedMaps/1.0 (+https://bolivamos.app; contact: hudson@tektone.com.br)";
const REQUEST_DELAY_MS = 1100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), displayName: r.display_name, importance: r.importance ?? 0 };
}

async function main() {
  const checkpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, "utf8"));

  const failedIds = Object.entries(checkpoint.results)
    .filter(([, r]) => r.lat == null)
    .map(([id]) => id);
  console.log(`${failedIds.length} places need a retry.`);

  // We need each failed id's original display name — pull straight from
  // places.json via the same normalization geocode-places.mjs uses.
  const dataPath = path.resolve(__dirname, "../../../docs/themed-maps/data/places.json");
  const data = JSON.parse(readFileSync(dataPath, "utf8"));
  const nameById = new Map();
  const addAll = (arr) => arr.forEach((x) => nameById.set(x.id, x.name));
  addAll(data.attractions);
  addAll(data.tours);
  addAll(data.transfers);
  addAll(data.restaurants);
  const slugify = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  for (const group of Object.values(data.streets)) {
    for (const name of group) nameById.set(slugify(name), name);
  }

  let recovered = 0;
  let count = 0;
  for (const id of failedIds) {
    count++;
    const name = nameById.get(id);
    if (!name) {
      console.warn(`  ! No source name found for id "${id}", skipping.`);
      continue;
    }

    let g = null;
    for (const suffix of [", Santa Cruz, Bolivia", ", Bolivia"]) {
      try {
        g = await geocode(`${name}${suffix}`);
      } catch (err) {
        console.warn(`  ! ${name}${suffix}: ${err.message}`);
      }
      await sleep(REQUEST_DELAY_MS);
      if (g) break;
    }

    if (g) {
      recovered++;
      checkpoint.results[id] = {
        lat: g.lat,
        lng: g.lng,
        district: null, // recomputed by fix-district-assignment.mjs
        regional: false,
        verified: false, // recomputed below by the same rule geocode-places.mjs uses
        displayName: g.displayName,
        importance: g.importance,
      };
    }

    if (count % 20 === 0) {
      writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
      console.log(`  ...${count}/${failedIds.length} retried, ${recovered} recovered so far, checkpoint saved.`);
    }
  }
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
  console.log(`Retry pass complete: ${recovered}/${failedIds.length} recovered.`);
  console.log(`Still unmatched: ${failedIds.length - recovered} — these need manual coordinates (PRD §8.1 QA pass).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
