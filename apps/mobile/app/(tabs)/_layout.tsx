import { Tabs } from "expo-router";
import { nativeColors } from "@bolivamos/design-tokens/native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: nativeColors.boliGreen,
        tabBarInactiveTintColor: nativeColors.mutedClayGray,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed" }} />
      <Tabs.Screen name="bolipass" options={{ title: "BoliPass" }} />
      <Tabs.Screen name="companion" options={{ title: "Companion" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
