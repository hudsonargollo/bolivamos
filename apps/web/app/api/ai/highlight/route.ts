import { NextResponse } from "next/server";
import { eq } from "@bolivibes/db";
import { createDb, venues } from "@bolivibes/db";
import { GeminiClient, generateVenueHighlight } from "@bolivibes/ai";
import { highlightRequestSchema, userPrefsKey, userPrefsValueSchema } from "@bolivibes/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireRole } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** BoliPass-only "Why You'll Love This" venue highlight (PRD 4.3). */
export async function GET(request: Request) {
  try {
    const session = await requireRole(request, "visitor");
    if (!session.isBoliPass) {
      return NextResponse.json({ error: "BoliPass subscription required" }, { status: 403 });
    }

    const url = new URL(request.url);
    const { venueId } = highlightRequestSchema.parse({ venueId: url.searchParams.get("venueId") });

    const { env } = cf();
    const db = createDb(env.DB);
    const [venue] = await db.select().from(venues).where(eq(venues.id, venueId)).limit(1);
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    const rawPrefs = await env.BOLIVIBES_KV.get(userPrefsKey(session.userId), "json");
    const interests = rawPrefs ? userPrefsValueSchema.parse(rawPrefs) : [];

    const client = new GeminiClient({ apiKey: env.GEMINI_API_KEY });
    const highlight = await generateVenueHighlight(client, venue.name, venue.category, interests);

    return NextResponse.json(highlight);
  } catch (err) {
    return toErrorResponse(err);
  }
}
