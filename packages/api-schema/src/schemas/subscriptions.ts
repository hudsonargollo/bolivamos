import { z } from "zod";

export const activateBoliPassResponseSchema = z.object({
  isBoliPassActive: z.literal(true),
  bolipassExpiresAt: z.string(),
});
export type ActivateBoliPassResponse = z.infer<typeof activateBoliPassResponseSchema>;
