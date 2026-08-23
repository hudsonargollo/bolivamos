#!/usr/bin/env node
// One-off correction: the first geocode-places.mjs run only resolved 3 of the
// 7 district centroids (bad Nominatim query strings for Zoo/Parque Urbano/
// Reloj & Clima/Las Brisas), so district assignment for that run's ~530
// places is skewed toward only La Ramada/Centro/Equipetrol. The query
// strings are fixed in geocode-places.mjs now (verified against live
// Nominatim), but re-running geocode-places.mjs won't fix already-checkpointed
// places (it skips anything already in the checkpoint). This script
// recomputes district/regional for every checkpointed place against the
// correct 7 centroids, then regenerates places.sql + places-report.json.
//
// Run once, after geocode-places.mjs's initial pass has fully completed:
//   node packages/db/scripts/fix-district-assignment.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const DATA_PATH = path.join(ROOT, "docs/themed-maps/data/places.json");
const SEEDS_DIR = path.join(__dirname, "../seeds");
const CHECKPOINT_PATH = path.join(SEEDS_DIR, "places-checkpoint.json");
const SQL_OUT_PATH = path.join(SEEDS_DIR, "places.sql");
const REPORT_OUT_PATH = path.join(SEEDS_DIR, "places-report.json");

const REGIONAL_RADIUS_KM = 20;

// Verified against live Nominatim on 2026-08-23 (see geocode-places.mjs DISTRICTS).
const DISTRICT_CENTERS = [
  { key: "Zoo", lat: -17.759631, lng: -63.1853464 },
  { key: "Parque Urbano", lat: -17.8052962, lng: -63.1436932 },
  { key: "La Ramada", lat: -17.78908, lng: -63.1863 },
  { key: "Centro", lat: -17.78325, lng: -63.18212 },
  { key: "Reloj & Clima", lat: -17.7840852, lng: -63.1817189 },
  { key: "Equipetrol", lat: -17.76399, lng: -63.1989 },
  { key: "Las Brisas", lat: -17.7491852, lng: -63.1762605 },
];
const CENTRO = DISTRICT_CENTERS.find((d) => d.key === "Centro");

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizePlaces(data) {
  const out = [];
  for (const a of data.attractions) out.push({ id: a.id, name: a.name, layer: "attraction", category: a.group ?? a.type ?? null, rating: a.rating ?? null, reviews: a.reviews ?? null, price: null, source: "tripadvisor" });
  for (const t of data.tours) out.push({ id: t.id, name: t.name, layer: "tour", category: t.group ?? t.type ?? null, rating: t.rating ?? null, reviews: t.reviews ?? null, price: null, source: "tripadvisor" });
  for (const t of data.transfers) out.push({ id: t.id, name: t.name, layer: "transfer", category: t.group ?? null, rating: t.rating ?? null, reviews: t.reviews ?? null, price: null, source: "tripadvisor" });
  for (const r of data.restaurants) out.push({ id: r.id, name: r.name, layer: "eat_drink", category: Array.isArray(r.cuisine) ? r.cuisine.join(", ") : (r.cuisine ?? null), rating: r.rating ?? null, reviews: r.reviews ?? null, price: r.price ?? null, source: "tripadvisor" });
  const streetGroups = { avenidas: "Avenue", calles: "Street", pasajes_pedestrian: "Pedestrian passage", roundabouts: "Roundabout", areas: "Area" };
  for (const [group, category] of Object.entries(streetGroups)) {
    for (const name of data.streets[group] ?? []) out.push({ id: slugify(name), name, layer: "street_zone", category, rating: null, reviews: null, price: null, source: "openalfa" });
  }
  return out;
}

function sqlString(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function main() {
  const checkpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, "utf8"));
  const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const places = normalizePlaces(data);

  let corrected = 0;
  for (const [id, g] of Object.entries(checkpoint.results)) {
    if (g.lat == null || g.lng == null) continue;
    let nearest = DISTRICT_CENTERS[0];
    let nearestDist = haversineKm(g.lat, g.lng, nearest.lat, nearest.lng);
    for (const d of DISTRICT_CENTERS.slice(1)) {
      const dist = haversineKm(g.lat, g.lng, d.lat, d.lng);
      if (dist < nearestDist) {
        nearest = d;
        nearestDist = dist;
      }
    }
    const newDistrict = nearestDist > REGIONAL_RADIUS_KM ? null : nearest.key;
    const newRegional = nearestDist > REGIONAL_RADIUS_KM;
    // Recompute verified too (same rule as geocode-places.mjs): a real match landing in
    // Bolivia, not Nominatim's `importance` score (that's global significance, not confidence).
    const newVerified = /Bolivia/i.test(g.displayName ?? "");
    if (g.district !== newDistrict || g.regional !== newRegional || g.verified !== newVerified) corrected++;
    g.verified = newVerified;
    g.district = newDistrict;
    g.regional = newRegional;
  }
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
  console.log(`Recomputed district assignment for ${Object.keys(checkpoint.results).length} places; ${corrected} changed.`);

  // Regenerate SQL + report (mirrors geocode-places.mjs's tail).
  const sqlLines = ["-- Generated by packages/db/scripts/fix-district-assignment.mjs — do not hand-edit."];
  const needsReview = [];
  let verifiedCount = 0;
  for (const place of places) {
    const g = checkpoint.results[place.id] ?? { lat: null, lng: null, district: null, regional: false, verified: false };
    if (g.verified) verifiedCount++;
    else needsReview.push({ id: place.id, name: place.name, layer: place.layer, reason: g.reason ?? "low-confidence", displayName: g.displayName });

    const cols = ["id", "name", "layer", "category", "district", "lat", "lng", "rating", "reviews", "price", "regional", "source", "verified"];
    const vals = [place.id, place.name, place.layer, place.category, g.district, g.lat, g.lng, place.rating, place.reviews, place.price, g.regional, place.source, g.verified];
    sqlLines.push(
      `INSERT INTO places (${cols.join(", ")}) VALUES (${vals.map(sqlString).join(", ")}) ON CONFLICT(id) DO UPDATE SET ` +
        cols.slice(1).map((c) => `${c}=excluded.${c}`).join(", ") + ";",
    );
  }
  writeFileSync(SQL_OUT_PATH, sqlLines.join("\n") + "\n");
  writeFileSync(
    REPORT_OUT_PATH,
    JSON.stringify({ total: places.length, verified: verifiedCount, verifiedPct: Math.round((verifiedCount / places.length) * 1000) / 10, needsReviewCount: needsReview.length, needsReview }, null, 2),
  );
  console.log(`Wrote ${SQL_OUT_PATH} and ${REPORT_OUT_PATH}`);
  console.log(`Verified: ${verifiedCount}/${places.length} (${Math.round((verifiedCount / places.length) * 1000) / 10}%)`);

  const byDistrict = {};
  for (const g of Object.values(checkpoint.results)) {
    const key = g.regional ? "(regional)" : (g.district ?? "(none)");
    byDistrict[key] = (byDistrict[key] ?? 0) + 1;
  }
  console.log("District distribution:", byDistrict);
}

main();
