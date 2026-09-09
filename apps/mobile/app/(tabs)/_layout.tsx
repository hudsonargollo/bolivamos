import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@bolivamos/design-tokens";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  const { t } = useT();
  const { scheme } = useTheme();
  const dark = scheme === "dark";

  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        headerShown: false,
        // Terracotta is the new primary/active accent (mobile-v2 reskin),
        // replacing boliGreen.
        tabBarActiveTintColor: colors.clayTerracotta,
        tabBarInactiveTintColor: dark ? "#8A7C63" : colors.mutedClayGray,
        tabBarStyle: dark ? { backgroundColor: "#1D1A17", borderTopColor: "#241F1B" } : undefined,
      }}
    >
      <Tabs.Screen name="feed" options={{ title: t("tabFeed"), tabBarIcon: tabIcon("compass") }} />
      <Tabs.Screen name="map" options={{ title: t("tabMap"), tabBarIcon: tabIcon("map") }} />
      <Tabs.Screen name="bolipass" options={{ title: t("tabBolipass"), tabBarIcon: tabIcon("card") }} />
      <Tabs.Screen
        name="companion"
        options={{ title: t("tabCompanion"), tabBarIcon: tabIcon("chatbubble-ellipses") }}
      />
      <Tabs.Screen name="profile" options={{ title: t("tabProfile"), tabBarIcon: tabIcon("person") }} />
    </Tabs>
  );
}
