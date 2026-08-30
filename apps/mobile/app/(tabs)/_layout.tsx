import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { nativeColors } from "@bolivamos/design-tokens/native";

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: nativeColors.boliGreen,
        tabBarInactiveTintColor: nativeColors.mutedClayGray,
      }}
    >
      <Tabs.Screen name="feed" options={{ title: "Feed", tabBarIcon: tabIcon("compass") }} />
      <Tabs.Screen name="map" options={{ title: "Map", tabBarIcon: tabIcon("map") }} />
      <Tabs.Screen name="bolipass" options={{ title: "BoliPass", tabBarIcon: tabIcon("card") }} />
      <Tabs.Screen
        name="companion"
        options={{ title: "Companion", tabBarIcon: tabIcon("chatbubble-ellipses") }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon("person") }} />
    </Tabs>
  );
}
