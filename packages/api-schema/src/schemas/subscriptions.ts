import { z } from "zod";

export const bolipassCheckoutRequestSchema = z.object({
  // Self-attested Bolivian tax ID — format-checked server-side, not real
  // identity verification. Optional; omitting it means the full $50 price.
  nit: z.string().optional(),
});
export type BolipassCheckoutRequest = z.infer<typeof bolipassCheckoutRequestSchema>;

export const bolipassCheckoutResponseSchema = z.object({
  checkoutUrl: z.string(),
  amountUsd: z.number(),
});
export type BolipassCheckoutResponse = z.infer<typeof bolipassCheckoutResponseSchema>;
