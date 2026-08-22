import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import type { HighlightResponse } from "@bolivamos/api-schema";
import { apiClient } from "@/lib/api";

/** "Why You'll Love This" AI highlight box (PRD 4.3) — drop into a venue detail screen. */
export function WhyYoullLoveThis({ venueId }: { venueId: string }) {
  const [highlight, setHighlight] = useState<HighlightResponse | null>(null);

  useEffect(() => {
    apiClient
      .getVenueHighlight(venueId)
      .then(setHighlight)
      .catch(() => setHighlight(null));
  }, [venueId]);

  if (!highlight) return null;

  return (
    <View className="rounded-lg border border-boli-yellow bg-white p-4">
      <Text className="text-boli-orange">✨ {highlight.headline}</Text>
      <Text className="mt-1 text-muted-clay-gray">{highlight.reason}</Text>
    </View>
  );
}
