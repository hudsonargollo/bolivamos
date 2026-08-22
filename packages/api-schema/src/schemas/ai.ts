import { z } from "zod";
import { categorySchema } from "./common";

export const itineraryRequestSchema = z.object({
  days: z.number().int().min(1).max(7).default(1),
  categories: z.array(categorySchema).min(1),
});
export type ItineraryRequest = z.infer<typeof itineraryRequestSchema>;

export const itineraryStopSchema = z.object({
  time: z.string(), // e.g. "14:00"
  venueId: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  hasBoliPassOffer: z.boolean(),
});
export type ItineraryStop = z.infer<typeof itineraryStopSchema>;

export const itineraryResponseSchema = z.object({
  days: z.array(z.object({ label: z.string(), stops: z.array(itineraryStopSchema) })),
});
export type ItineraryResponse = z.infer<typeof itineraryResponseSchema>;

export const chatRequestSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const highlightRequestSchema = z.object({
  venueId: z.string(),
});
export type HighlightRequest = z.infer<typeof highlightRequestSchema>;

export const highlightResponseSchema = z.object({
  headline: z.string(),
  reason: z.string(),
});
export type HighlightResponse = z.infer<typeof highlightResponseSchema>;
