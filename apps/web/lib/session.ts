import { verifySession, sessionKey, sessionValueSchema, type SessionValue } from "@bolivamos/api-schema";
import { cf } from "./cloudflare";

export const SESSION_COOKIE_NAME = "bv_session";

export interface CurrentSession {
  token: string;
  userId: string;
  email: string;
  role: SessionValue["role"];
  isBoliPass: boolean;
}

function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice("Bearer ".length);

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

/**
 * Verifies the JWT (signature + expiry) then cross-checks the KV session
 * record for the *current* role/isBoliPass — a lapsed subscription or a
 * revoked/banned session won't have a live KV entry even if the JWT itself
 * hasn't expired yet.
 */
export async function resolveSession(token: string | null): Promise<CurrentSession | null> {
  if (!token) return null;

  const { env } = cf();

  try {
    const payload = await verifySession(token, env.JWT_SECRET);
    const raw = await env.BOLIVAMOS_KV.get(sessionKey(token), "json");
    if (!raw) return null; // revoked, logged out, or never issued via KV
    const session = sessionValueSchema.parse(raw);

    return {
      token,
      userId: payload.sub,
      email: payload.email,
      role: session.role,
      isBoliPass: session.isBoliPass,
    };
  } catch {
    return null;
  }
}

export function getCurrentSession(request: Request): Promise<CurrentSession | null> {
  return resolveSession(extractToken(request));
}

export async function requireSession(request: Request): Promise<CurrentSession> {
  const session = await getCurrentSession(request);
  if (!session) throw new SessionError(401, "Not authenticated");
  return session;
}

export async function requireRole(
  request: Request,
  role: CurrentSession["role"],
): Promise<CurrentSession> {
  const session = await requireSession(request);
  if (session.role !== role) throw new SessionError(403, "Forbidden");
  return session;
}

export class SessionError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "SessionError";
  }
}
