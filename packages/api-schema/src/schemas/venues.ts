import { z } from "zod";
import { categorySchema } from "./common";

export const createVenueRequestSchema = z.object({
  name: z.string().min(1),
  category: categorySchema,
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
export type CreateVenueRequest = z.infer<typeof createVenueRequestSchema>;

export const venueSchema = z.object({
  id: z.string(),
  hostId: z.string().nullable(),
  name: z.string(),
  category: categorySchema,
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  createdAt: z.string().nullable(),
});
export type VenueDto = z.infer<typeof venueSchema>;
