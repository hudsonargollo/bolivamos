export const PLACE_LAYERS = ["attraction", "eat_drink", "tour", "transfer", "street_zone", "event"] as const;
export type PlaceLayer = (typeof PLACE_LAYERS)[number];

const LABELS: Record<PlaceLayer, string> = {
  attraction: "Attraction",
  eat_drink: "Eat & Drink",
  tour: "Tour",
  transfer: "Transfer",
  street_zone: "Street / Zone",
  event: "Event / Nightlife",
};

export function layerLabel(layer: string): string {
  return LABELS[layer as PlaceLayer] ?? layer;
}
