import { z } from "zod";

export const roleSchema = z.enum(["visitor", "host", "admin"]);
export type Role = z.infer<typeof roleSchema>;

// Roles a client is allowed to request for itself at signup/login time.
// "admin" is intentionally excluded — it can only be granted via a direct
// DB update (see packages/db/migrations/0005_admin_role.sql).
export const selfAssignableRoleSchema = z.enum(["visitor", "host"]);
export type SelfAssignableRole = z.infer<typeof selfAssignableRoleSchema>;

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
