import { verifySession, sessionKey, sessionValueSchema, type SessionValue } from "@bolivamos/api-schema";
import { createDb, users } from "@bolivamos/db";
import { eq } from "@bolivamos/db";
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
 * record for the *current* role — a revoked/logged-out session won't have a
 * live KV entry even if the JWT itself hasn't expired yet.
 */
export async function resolveSession(token: string | null): Promise<CurrentSession | null> {
  if (!token) return null;

  const { env } = cf();

  try {
    const payload = await verifySession(token, env.JWT_SECRET);
    const raw = await env.BOLIVAMOS_KV.get(sessionKey(token), "json");
    if (!raw) return null; // revoked, logged out, or never issued via KV
    const session = sessionValueSchema.parse(raw);

    // isBanned and isBoliPass are both checked fresh against D1 (not cached
    // in the KV session record) rather than trusted from the JWT/KV shortcut
    // — a ban takes effect on the user's very next request, not just their
    // next login, and BoliPass activation via a Stripe webhook (which has no
    // session token and so cannot update this user's KV record directly —
    // see app/api/webhooks/stripe/route.ts) becomes visible the same way.
    // Expiry is checked here too, not just the isBolipassActive flag, since
    // that flag is only flipped false by a customer.subscription.deleted
    // webhook, which could lag a passed bolipassExpiresAt if delayed or lost.
    const db = createDb(env.DB);
    const [user] = await db
      .select({ isBanned: users.isBanned, isBolipassActive: users.isBolipassActive, bolipassExpiresAt: users.bolipassExpiresAt })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);
    if (user?.isBanned) return null;

    const isBoliPass =
      Boolean(user?.isBolipassActive) && (!user?.bolipassExpiresAt || new Date(user.bolipassExpiresAt) > new Date());

    return {
      token,
      userId: payload.sub,
      email: payload.email,
      role: session.role,
      isBoliPass,
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
