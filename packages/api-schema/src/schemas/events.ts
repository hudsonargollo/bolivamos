import { z } from "zod";
import { eventFilterSchema } from "./common";

export const listEventsQuerySchema = z.object({
  filter: eventFilterSchema.optional(),
  category: z.string().optional(),
});
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

export const createEventRequestSchema = z.object({
  venueId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string(), // ISO 8601
  endTime: z.string().optional(),
  imageUrl: z.string().url().optional(),
});
export type CreateEventRequest = z.infer<typeof createEventRequestSchema>;

export const eventSchema = z.object({
  id: z.string(),
  venueId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  imageUrl: z.string().nullable(),
  category: z.string().nullable(),
  priceText: z.string().nullable(),
  isFree: z.boolean().nullable(),
  venueName: z.string().nullable(),
  district: z.string().nullable(),
  mapsUrl: z.string().nullable(),
});
export type EventDto = z.infer<typeof eventSchema>;
