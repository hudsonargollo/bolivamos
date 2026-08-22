import { z } from "zod";
import { discountTypeSchema } from "./common";

export const createVoucherRequestSchema = z.object({
  venueId: z.string(),
  title: z.string().min(1),
  discountType: discountTypeSchema.default("2_FOR_1"),
  termsConditions: z.string().optional(),
});
export type CreateVoucherRequest = z.infer<typeof createVoucherRequestSchema>;

export const voucherSchema = z.object({
  id: z.string(),
  venueId: z.string().nullable(),
  title: z.string(),
  discountType: z.string().nullable(),
  termsConditions: z.string().nullable(),
  isActive: z.boolean().nullable(),
});
export type VoucherDto = z.infer<typeof voucherSchema>;

// Freemium teaser shown to non-BoliPass subscribers (PRD 4.2)
export const lockedVoucherTeaserSchema = z.object({
  voucher: voucherSchema,
  estimatedSavingsBob: z.number(),
  locked: z.literal(true),
});
export type LockedVoucherTeaser = z.infer<typeof lockedVoucherTeaserSchema>;
