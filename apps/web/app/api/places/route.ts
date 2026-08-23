import { NextResponse } from "next/server";
import { createDb, places } from "@bolivamos/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { listPlacesQuerySchema, type PlaceFeatureCollection } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { toErrorResponse } from "@/lib/api-errors";

function toFeature(place: typeof places.$inferSelect) {
  return {
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [place.lng ?? 0, place.lat ?? 0] as [number, number] },
    properties: {
      id: place.id,
      name: place.name,
      layer: place.layer,
      category: place.category,
      district: place.district,
      rating: place.rating,
      reviews: place.reviews,
      price: place.price,
      regional: place.regional,
      venueId: place.venueId,
      source: place.source,
      verified: place.verified,
    },
  };
}

/**
 * GeoJSON FeatureCollection for the themed map (PRD §8.3), filterable by
 * layer/district/bbox. Only `verified` rows ship in production — unverified
 * geocodes are still under manual QA (see packages/db/scripts/geocode-places.mjs).
 * Cached at the edge; the tile proxy (mapz key) is a separate route.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = listPlacesQuerySchema.parse(Object.fromEntries(url.searchParams));

    const { env } = cf();
    const db = createDb(env.DB);

    const conditions = [eq(places.verified, true)];
    if (query.layer) conditions.push(eq(places.layer, query.layer));
    if (query.district) conditions.push(eq(places.district, query.district));
    if (query.bbox) {
      // listPlacesQuerySchema's regex guarantees exactly 4 comma-separated numbers.
      const parts = query.bbox.split(",").map(Number);
      const minLng = parts[0] as number;
      const minLat = parts[1] as number;
      const maxLng = parts[2] as number;
      const maxLat = parts[3] as number;
      conditions.push(gte(places.lng, minLng), lte(places.lng, maxLng), gte(places.lat, minLat), lte(places.lat, maxLat));
    }

    const rows = await db
      .select()
      .from(places)
      .where(and(...conditions));

    const collection: PlaceFeatureCollection = {
      type: "FeatureCollection",
      features: rows.map(toFeature),
    };

    return NextResponse.json(collection, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  } catch (err) {
    return toErrorResponse(err);
  }
}
