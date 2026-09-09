import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Honest placeholder for tab chips whose real backend doesn't exist yet
 * (Connect's Boards/Crews/Match — see the mobile-v2 rebuild plan) — shows
 * the tab's real intent without faking interactive data the way the design
 * prototype did.
 */
export function ComingSoon({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return (
    <View className="items-center rounded-xl bg-white p-8 shadow-clay dark:bg-dark-card1">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-clay-terracotta/14">
        <Ionicons name={icon} size={26} color="#8f4225" />
      </View>
      <Text className="mb-1 font-display text-lg text-charcoal-dark dark:text-dark-ink">{title}</Text>
      <Text className="text-center text-sm font-semibold text-muted-clay-gray dark:text-dark-sub">{body}</Text>
    </View>
  );
}
