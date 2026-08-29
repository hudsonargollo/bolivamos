import { Stack } from "expo-router";

export default function MarketplaceLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Marketplace" }} />
      <Stack.Screen name="[id]" options={{ title: "Marketplace" }} />
    </Stack>
  );
}
