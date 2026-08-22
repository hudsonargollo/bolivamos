import { z } from "zod";
import { roleSchema } from "./common";

export const mobileGoogleLoginRequestSchema = z.object({
  idToken: z.string().min(1),
  role: roleSchema.optional(),
});
export type MobileGoogleLoginRequest = z.infer<typeof mobileGoogleLoginRequestSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  role: roleSchema,
  isBoliPassActive: z.boolean(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const devLoginRequestSchema = z.object({
  email: z.string().email().default("dev@bolivamos.test"),
  role: roleSchema.default("visitor"),
});
export type DevLoginRequest = z.infer<typeof devLoginRequestSchema>;
