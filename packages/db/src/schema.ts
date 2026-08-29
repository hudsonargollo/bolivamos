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
  role: text("role", { enum: ["visitor", "host", "admin"] }).default("visitor"),
  isBolipassActive: integer("is_bolipass_active", { mode: "boolean" }).default(false),
  bolipassExpiresAt: text("bolipass_expires_at"),
  preferences: text("preferences"), // JSON array of selected categories
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  passwordHash: text("password_hash"), // null for OAuth/dev-login-only accounts
  // VIP Connect trust & safety — a reported user an admin has actioned stops
  // being able to resolve a session at all (see lib/session.ts).
  isBanned: integer("is_banned", { mode: "boolean" }).default(false),
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
  // B2B SaaS tier (roadmap pillar 1) — manually toggled by admin until real
  // billing/subscription status exists to drive it.
  tier: text("tier", { enum: ["free", "premium"] }).default("free"),
  // Priority placement in "Best Bars" / "Things to Do This Weekend" (pillar 2).
  featured: integer("featured", { mode: "boolean" }).default(false),
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
  // Invite-only VIP community parties (roadmap pillar 1) — gates visibility
  // to BoliPass subscribers once the public feed enforces it.
  isVipOnly: integer("is_vip_only", { mode: "boolean" }).default(false),
  // Priority placement in "Things to Do This Weekend" (pillar 2).
  featured: integer("featured", { mode: "boolean" }).default(false),
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

export const conciergeConversations = sqliteTable("concierge_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const conciergeMessages = sqliteTable("concierge_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conciergeConversations.id).notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const pushCampaigns = sqliteTable("push_campaigns", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  target: text("target", { enum: ["all", "vip", "host"] }).notNull().default("all"),
  sentAt: text("sent_at"),
  recipientCount: integer("recipient_count"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["tour", "audio_tour", "ticket"] }).notNull(),
  hostId: text("host_id").references(() => users.id),
  eventId: text("event_id").references(() => events.id),
  title: text("title").notNull(),
  description: text("description"),
  priceBob: real("price_bob").notNull(),
  // Stripe doesn't settle in BOB — a Stripe checkout needs this set; the
  // manual QR/crypto rails go by priceBob directly.
  priceUsd: real("price_usd"),
  audioUrl: text("audio_url"),
  capacity: integer("capacity"),
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Admin-managed receiving details for the three manually-confirmed rails
// (Stripe is the only automated one — see orders.paymentMethod).
export const paymentMethods = sqliteTable("payment_methods", {
  id: text("id").primaryKey(),
  method: text("method", { enum: ["qr_bolivia", "qr_pix", "crypto"] }).notNull(),
  label: text("label").notNull(),
  qrImageUrl: text("qr_image_url"),
  addressOrKey: text("address_or_key"),
  instructions: text("instructions"),
  active: integer("active", { mode: "boolean" }).default(true),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  productId: text("product_id").references(() => products.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  quantity: integer("quantity").default(1),
  totalPriceBob: real("total_price_bob").notNull(),
  paymentMethod: text("payment_method", { enum: ["stripe", "qr_bolivia", "qr_pix", "crypto"] }).notNull(),
  referenceNote: text("reference_note"),
  stripeSessionId: text("stripe_session_id"),
  status: text("status", { enum: ["pending", "paid", "cancelled"] }).default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// VIP Connect & Dating (roadmap pillar 1) — opt-in attendance visibility,
// event-scoped connect requests, messaging gated on acceptance, and the
// safety rails (block/report) that ship alongside it, not after.
export const eventAttendance = sqliteTable("event_attendance", {
  id: text("id").primaryKey(),
  eventId: text("event_id").references(() => events.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  visible: integer("visible", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const connectRequests = sqliteTable("connect_requests", {
  id: text("id").primaryKey(),
  eventId: text("event_id").references(() => events.id).notNull(),
  fromUserId: text("from_user_id").references(() => users.id).notNull(),
  toUserId: text("to_user_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "accepted", "declined"] }).default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const connectMessages = sqliteTable("connect_messages", {
  id: text("id").primaryKey(),
  requestId: text("request_id").references(() => connectRequests.id).notNull(),
  senderId: text("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userBlocks = sqliteTable("user_blocks", {
  id: text("id").primaryKey(),
  blockerId: text("blocker_id").references(() => users.id).notNull(),
  blockedId: text("blocked_id").references(() => users.id).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userReports = sqliteTable("user_reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").references(() => users.id).notNull(),
  reportedId: text("reported_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  context: text("context"),
  status: text("status", { enum: ["open", "reviewed", "dismissed"] }).default("open"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
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
export type ConciergeConversation = typeof conciergeConversations.$inferSelect;
export type NewConciergeConversation = typeof conciergeConversations.$inferInsert;
export type ConciergeMessage = typeof conciergeMessages.$inferSelect;
export type NewConciergeMessage = typeof conciergeMessages.$inferInsert;
export type PushCampaign = typeof pushCampaigns.$inferSelect;
export type NewPushCampaign = typeof pushCampaigns.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type EventAttendance = typeof eventAttendance.$inferSelect;
export type NewEventAttendance = typeof eventAttendance.$inferInsert;
export type ConnectRequest = typeof connectRequests.$inferSelect;
export type NewConnectRequest = typeof connectRequests.$inferInsert;
export type ConnectMessage = typeof connectMessages.$inferSelect;
export type NewConnectMessage = typeof connectMessages.$inferInsert;
export type UserBlock = typeof userBlocks.$inferSelect;
export type NewUserBlock = typeof userBlocks.$inferInsert;
export type UserReport = typeof userReports.$inferSelect;
export type NewUserReport = typeof userReports.$inferInsert;
