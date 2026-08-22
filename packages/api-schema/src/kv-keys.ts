import { z } from "zod";
import { roleSchema, categorySchema } from "./schemas/common";

/**
 * Typed builders + value schemas for every Cloudflare KV key pattern in the
 * PRD (section 5). Always go through these instead of hand-building
 * template-string keys, so a rename or shape change happens in one place.
 */

// session:${token} -> { userId, role, isBoliPass }
export const sessionValueSchema = z.object({
  userId: z.string(),
  role: roleSchema,
  isBoliPass: z.boolean(),
});
export type SessionValue = z.infer<typeof sessionValueSchema>;
export const sessionKey = (token: string) => `session:${token}`;

// user:prefs:${userId} -> ["dancing", "historical", "gastronomy"]
export const userPrefsValueSchema = z.array(categorySchema);
export type UserPrefsValue = z.infer<typeof userPrefsValueSchema>;
export const userPrefsKey = (userId: string) => `user:prefs:${userId}`;

// lock:redemption:${userId}:${voucherId} -> { timestamp }
export const redemptionLockValueSchema = z.object({
  timestamp: z.number(),
});
export type RedemptionLockValue = z.infer<typeof redemptionLockValueSchema>;
export const redemptionLockKey = (userId: string, voucherId: string) =>
  `lock:redemption:${userId}:${voucherId}`;

/** Seconds a redemption lock is held for — prevents double-scanning the same voucher. */
export const REDEMPTION_LOCK_TTL_SECONDS = 60 * 60 * 24; // 24h, per PRD KV comment

// user:push:${userId} -> expoPushToken (not in the PRD's KV list, but needed
// to implement PRD 4.5's push notifications — same key-prefix convention as
// the other patterns above).
export const userPushTokenKey = (userId: string) => `user:push:${userId}`;
