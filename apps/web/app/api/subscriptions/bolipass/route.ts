import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createDb, users } from "@bolivamos/db";
import { sessionKey } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Activates a BoliPass subscription (PRD 4.2). No payment provider is
 * integrated yet (explicitly out of scope for this scaffold) — this just
 * flips the flag so the rest of the redemption flow is testable end-to-end.
 */
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);

    const expiresAt = new Date(Date.now() + ONE_YEAR_MS).toISOString();
    await db
      .update(users)
      .set({ isBolipassActive: true, bolipassExpiresAt: expiresAt })
      .where(eq(users.id, session.userId));

    // Keep the KV session record's cached isBoliPass flag in sync so
    // requireSession() sees the change without forcing a re-login.
    await env.BOLIVAMOS_KV.put(
      sessionKey(session.token),
      JSON.stringify({ userId: session.userId, role: session.role, isBoliPass: true }),
      { expirationTtl: 60 * 60 * 24 * 30 },
    );

    return NextResponse.json({ isBoliPassActive: true, bolipassExpiresAt: expiresAt });
  } catch (err) {
    return toErrorResponse(err);
  }
}
