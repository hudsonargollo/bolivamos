import { z } from "zod";
import { categorySchema } from "./common";

export const updatePreferencesRequestSchema = z.object({
  categories: z.array(categorySchema),
});
export type UpdatePreferencesRequest = z.infer<typeof updatePreferencesRequestSchema>;

export const registerPushTokenRequestSchema = z.object({
  expoPushToken: z.string().min(1),
});
export type RegisterPushTokenRequest = z.infer<typeof registerPushTokenRequestSchema>;

export const totalSavedResponseSchema = z.object({
  totalSavedBob: z.number(),
});
export type TotalSavedResponse = z.infer<typeof totalSavedResponseSchema>;
