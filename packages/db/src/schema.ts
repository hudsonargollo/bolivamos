import { sql } from "drizzle-orm";
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

/**
 * Mirrors packages/db/migrations/0000_init.sql field-for-field. That file
 * (the exact DDL from the PRD) is the source of truth for the actual D1
 * schema — this is the typed Drizzle view of the same tables.
 */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role", { enum: ["visitor", "host"] }).default("visitor"),
  isBolipassActive: integer("is_bolipass_active", { mode: "boolean" }).default(false),
  bolipassExpiresAt: text("bolipass_expires_at"),
  preferences: text("preferences"), // JSON array of selected categories
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const venues = sqliteTable("venues", {
  id: text("id").primaryKey(),
  hostId: text("host_id").references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  qrSecretHash: text("qr_secret_hash").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  venueId: text("venue_id").references(() => venues.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  imageUrl: text("image_url"),
  // Public-listing fields for imported/aggregated events (no host venue row).
  category: text("category"),
  priceText: text("price_text"),
  isFree: integer("is_free", { mode: "boolean" }).default(false),
  venueName: text("venue_name"),
  district: text("district"),
  mapsUrl: text("maps_url"),
  sourceSlug: text("source_slug").unique(),
  // Geocoded from venueName (packages/db/scripts/geocode-events.mjs) — no
  // venue row to join against, since venueId is null for imported events.
  lat: real("lat"),
  lng: real("lng"),
});

export const vouchers = sqliteTable("vouchers", {
  id: text("id").primaryKey(),
  venueId: text("venue_id").references(() => venues.id),
  title: text("title").notNull(),
  discountType: text("discount_type").default("2_FOR_1"),
  termsConditions: text("terms_conditions"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const redemptions = sqliteTable("redemptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  voucherId: text("voucher_id").references(() => vouchers.id),
  savedAmountBob: real("saved_amount_bob"),
  redeemedAt: text("redeemed_at").default(sql`CURRENT_TIMESTAMP`),
});

export const places = sqliteTable("places", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  layer: text("layer", { enum: ["attraction", "eat_drink", "tour", "transfer", "street_zone"] }).notNull(),
  category: text("category"),
  district: text("district"),
  lat: real("lat"),
  lng: real("lng"),
  rating: real("rating"),
  reviews: integer("reviews"),
  price: text("price"),
  regional: integer("regional", { mode: "boolean" }).default(false),
  venueId: text("venue_id").references(() => venues.id),
  source: text("source", { enum: ["tripadvisor", "openalfa", "manual"] }).notNull(),
  verified: integer("verified", { mode: "boolean" }).default(false),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Voucher = typeof vouchers.$inferSelect;
export type NewVoucher = typeof vouchers.$inferInsert;
export type Redemption = typeof redemptions.$inferSelect;
export type NewRedemption = typeof redemptions.$inferInsert;
export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
