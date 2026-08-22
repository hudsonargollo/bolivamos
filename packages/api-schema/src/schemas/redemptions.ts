import { z } from "zod";

// Payload encoded in a venue's static, printable QR code (PRD 4.2 / 4.4).
// `sig` = HMAC-SHA256(venue.qr_secret_hash, venueId), verified server-side
// before a redemption is allowed to proceed.
export const qrPayloadSchema = z.object({
  venueId: z.string(),
  sig: z.string(),
});
export type QrPayload = z.infer<typeof qrPayloadSchema>;

export const redeemVoucherRequestSchema = z.object({
  voucherId: z.string(),
  qrPayload: qrPayloadSchema,
  // Not derivable from the given schema (no menu/ticket price data) — the
  // client reports what it saved, pending a real pricing/product decision.
  savedAmountBob: z.number().nonnegative().optional(),
});
export type RedeemVoucherRequest = z.infer<typeof redeemVoucherRequestSchema>;

export const redemptionSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  voucherId: z.string().nullable(),
  savedAmountBob: z.number().nullable(),
  redeemedAt: z.string().nullable(),
});
export type RedemptionDto = z.infer<typeof redemptionSchema>;

export const redeemVoucherResponseSchema = z.object({
  redemption: redemptionSchema,
  totalSavedBob: z.number(),
});
export type RedeemVoucherResponse = z.infer<typeof redeemVoucherResponseSchema>;
