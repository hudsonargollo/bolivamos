import { z } from "zod";

export const roleSchema = z.enum(["visitor", "host"]);
export type Role = z.infer<typeof roleSchema>;

// Category preference options (PRD 3.1 / 4.1)
export const categorySchema = z.enum([
  "music",
  "nightlife",
  "gastronomy",
  "historical",
  "cultural",
]);
export type Category = z.infer<typeof categorySchema>;

export const eventFilterSchema = z.enum(["today", "tomorrow", "sunday", "weekend"]);
export type EventFilter = z.infer<typeof eventFilterSchema>;

export const discountTypeSchema = z.literal("2_FOR_1");
