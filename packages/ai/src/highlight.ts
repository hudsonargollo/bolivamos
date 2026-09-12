import type { HighlightResponse } from "@bolivibes/api-schema";
import { highlightResponseSchema } from "@bolivibes/api-schema";
import type { Category } from "@bolivibes/api-schema";
import { GeminiClient } from "./gemini-client";

export const categoryHighlightPromptMap: Record<Category, string> = {
  music:
    "Focus on the live music value: genre, sound, performance energy, crowd mood, and whether it fits discovering local Santa Cruz artists or dancing with friends.",
  nightlife:
    "Focus on the night-out value: atmosphere, peak-hour energy, drinks, dancing, safety/context before arriving, and why it works for a group deciding where to go tonight.",
  gastronomy:
    "Focus on the food-and-drink value: signature dish or drink angle, ambience for meals, sharing with friends, date-night potential, and why it is worth choosing over another restaurant.",
  historical:
    "Focus on the heritage value: local story, architecture, neighborhood context, cultural memory, and why the place helps visitors or locals understand Santa Cruz better.",
  cultural:
    "Focus on the cultural value: art, community, performance, learning, social connection, and why the experience feels more meaningful than a generic outing.",
};

const fallbackHighlightPrompt =
  "Focus on the venue's practical value: what makes it worth choosing, who it fits, when to go, and the clearest benefit for this user's saved interests.";

function isCategory(value: string): value is Category {
  return Object.prototype.hasOwnProperty.call(categoryHighlightPromptMap, value);
}

function buildVenueHighlightPrompt(
  venueName: string,
  venueCategory: string,
  userInterests: Category[],
): string {
  const categoryInstruction = isCategory(venueCategory)
    ? categoryHighlightPromptMap[venueCategory]
    : fallbackHighlightPrompt;
  const savedInterests = userInterests.length > 0 ? userInterests.join(", ") : "none saved yet";

  return [
    "You write BoliVibes venue highlights for Santa Cruz de la Sierra.",
    `Venue: ${venueName}.`,
    `Venue category: ${venueCategory}.`,
    `User's saved interests: ${savedInterests}.`,
    `Category lens: ${categoryInstruction}`,
    'Return JSON only with this exact shape: { "headline": string, "reason": string }.',
    "Headline: one short, specific line, max 72 characters.",
    "Reason: one sentence, warm and useful, max 180 characters.",
    "Do not invent prices, discounts, events, or facts that were not provided.",
  ].join(" ");
}

/**
 * "Why You'll Love This" venue highlight (PRD 4.3). Uses a category-specific
 * prompt lens so music, nightlife, gastronomy, historical and cultural venues
 * receive different recommendation guidance.
 */
export async function generateVenueHighlight(
  client: GeminiClient,
  venueName: string,
  venueCategory: string,
  userInterests: Category[],
): Promise<HighlightResponse> {
  const prompt = buildVenueHighlightPrompt(venueName, venueCategory, userInterests);

  const text = await client.generateContent(prompt, { responseMimeType: "application/json" });
  return highlightResponseSchema.parse(JSON.parse(text));
}
