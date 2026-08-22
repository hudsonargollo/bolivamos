import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { z } from "zod";
import { roleSchema } from "./schemas/common";

export const sessionPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  role: roleSchema,
  isBoliPass: z.boolean(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const ALG = "HS256";

function toKey(secret: string) {
  return new TextEncoder().encode(secret);
}

/** Signs a session JWT. The resulting compact string doubles as the KV `session:${token}` lookup key. */
export async function signSession(
  payload: SessionPayload,
  secret: string,
  expiresIn = "30d",
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(toKey(secret));
}

/** Verifies signature + expiry only. Callers that need the *current* role/isBoliPass must also read the KV session record — see packages/api-schema/src/kv-keys.ts. */
export async function verifySession(
  token: string,
  secret: string,
): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, toKey(secret), { algorithms: [ALG] });
  return sessionPayloadSchema.parse(payload);
}

/** Unverified decode — mobile-only convenience to check `exp` before firing a request. Never trust this for authorization. */
export function decodeSessionUnsafe(token: string): SessionPayload | null {
  try {
    return sessionPayloadSchema.parse(decodeJwt(token));
  } catch {
    return null;
  }
}
