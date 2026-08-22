import type { ItineraryRequest, ItineraryResponse } from "@bolivamos/api-schema";
import { itineraryResponseSchema } from "@bolivamos/api-schema";
import { GeminiClient } from "./gemini-client";

/**
 * Personalized itinerary builder (PRD 4.3). Prompt is intentionally minimal —
 * real prompt engineering (grounding on live venues/vouchers, tone tuning) is
 * out of scope for this scaffold pass.
 */
export async function buildItinerary(
  client: GeminiClient,
  request: ItineraryRequest,
): Promise<ItineraryResponse> {
  const prompt = [
    `Create a ${request.days}-day Santa Cruz de la Sierra, Bolivia itinerary.`,
    `Focus on these interests: ${request.categories.join(", ")}.`,
    `Where relevant, note BoliPass 2-for-1 partner opportunities.`,
    `Respond as JSON matching: { days: [{ label: string, stops: [{ time, venueId, title, description, hasBoliPassOffer }] }] }`,
  ].join(" ");

  const text = await client.generateContent(prompt, { responseMimeType: "application/json" });
  return itineraryResponseSchema.parse(JSON.parse(text));
}
