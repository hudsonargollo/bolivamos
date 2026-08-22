import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createDb, redemptions } from "@bolivamos/db";
import { cf } from "@/lib/cloudflare";
import { requireSession } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** Backs the "Total Saved" dashboard (PRD 4.2). */
export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const { env } = cf();
    const db = createDb(env.DB);

    const rows = await db
      .select({ savedAmountBob: redemptions.savedAmountBob })
      .from(redemptions)
      .where(eq(redemptions.userId, session.userId));

    const totalSavedBob = rows.reduce((sum, r) => sum + (r.savedAmountBob ?? 0), 0);
    return NextResponse.json({ totalSavedBob });
  } catch (err) {
    return toErrorResponse(err);
  }
}
