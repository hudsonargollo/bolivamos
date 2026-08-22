import { NextResponse } from "next/server";
import { GeminiClient, buildItinerary } from "@bolivamos/ai";
import { itineraryRequestSchema } from "@bolivamos/api-schema";
import { cf } from "@/lib/cloudflare";
import { requireRole } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-errors";

/** BoliPass-only itinerary builder (PRD 4.3). Bundled into the subscription tier. */
export async function POST(request: Request) {
  try {
    const session = await requireRole(request, "visitor");
    if (!session.isBoliPass) {
      return NextResponse.json({ error: "BoliPass subscription required" }, { status: 403 });
    }

    const body = itineraryRequestSchema.parse(await request.json());
    const { env } = cf();
    const client = new GeminiClient({ apiKey: env.GEMINI_API_KEY });
    const itinerary = await buildItinerary(client, body);

    return NextResponse.json(itinerary);
  } catch (err) {
    return toErrorResponse(err);
  }
}
