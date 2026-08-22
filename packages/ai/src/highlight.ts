import type { HighlightResponse } from "@bolivamos/api-schema";
import { highlightResponseSchema } from "@bolivamos/api-schema";
import type { Category } from "@bolivamos/api-schema";
import { GeminiClient } from "./gemini-client";

/**
 * "Why You'll Love This" venue highlight (PRD 4.3). Real implementation
 * should pass actual venue details; this stub takes just the venue name +
 * category + the user's saved interests.
 */
export async function generateVenueHighlight(
  client: GeminiClient,
  venueName: string,
  venueCategory: string,
  userInterests: Category[],
): Promise<HighlightResponse> {
  const prompt = [
    `Venue: ${venueName} (category: ${venueCategory}).`,
    `User's saved interests: ${userInterests.join(", ") || "none saved yet"}.`,
    `Write a one-line headline and a short reason this venue matches the user, as JSON: { headline, reason }.`,
  ].join(" ");

  const text = await client.generateContent(prompt, { responseMimeType: "application/json" });
  return highlightResponseSchema.parse(JSON.parse(text));
}
