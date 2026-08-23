import { z } from "zod";

// docs/themed-maps/PRD-themed-interactive-maps.md §8.2 — mirrors packages/db/src/schema.ts's places table.
export const placeLayerSchema = z.enum(["attraction", "eat_drink", "tour", "transfer", "street_zone"]);
export type PlaceLayer = z.infer<typeof placeLayerSchema>;

// The hero scene's 7 camera-stop districts (PRD §7.4).
export const placeDistrictSchema = z.enum([
  "Zoo",
  "Parque Urbano",
  "La Ramada",
  "Centro",
  "Reloj & Clima",
  "Equipetrol",
  "Las Brisas",
]);
export type PlaceDistrict = z.infer<typeof placeDistrictSchema>;

// GET /api/places query params (PRD §8.3): layer/district/bbox filters.
// bbox is "minLng,minLat,maxLng,maxLat" (standard GeoJSON/OpenLayers bbox order).
export const listPlacesQuerySchema = z.object({
  layer: placeLayerSchema.optional(),
  district: placeDistrictSchema.optional(),
  bbox: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)
    .optional(),
});
export type ListPlacesQuery = z.infer<typeof listPlacesQuerySchema>;

export const placeSchema = z.object({
  id: z.string(),
  name: z.string(),
  layer: placeLayerSchema,
  category: z.string().nullable(),
  district: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  rating: z.number().nullable(),
  reviews: z.number().nullable(),
  price: z.string().nullable(),
  regional: z.boolean().nullable(),
  venueId: z.string().nullable(),
  source: z.string(),
  verified: z.boolean().nullable(),
});
export type PlaceDto = z.infer<typeof placeSchema>;

// GET /api/places responds with a GeoJSON FeatureCollection (PRD §8.3) so it
// drops straight into an OpenLayers ol.source.Vector.
export const placeFeatureSchema = z.object({
  type: z.literal("Feature"),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  }),
  properties: placeSchema.omit({ lat: true, lng: true }),
});
export type PlaceFeature = z.infer<typeof placeFeatureSchema>;

export const placeFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(placeFeatureSchema),
});
export type PlaceFeatureCollection = z.infer<typeof placeFeatureCollectionSchema>;
