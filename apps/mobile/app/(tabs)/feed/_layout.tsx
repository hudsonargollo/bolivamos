import { Stack } from "expo-router";
import { useTheme } from "@/lib/use-theme";
import { headerScreenOptions } from "@/lib/header-options";

export default function FeedLayout() {
  const { scheme } = useTheme();

  return (
    <Stack screenOptions={headerScreenOptions(scheme)}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Immersive full-bleed hero layout has its own floating back button —
          no native header bar, matching the prototype's composition. */}
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
