import { Stack } from "expo-router";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";
import { headerScreenOptions } from "@/lib/header-options";

export default function CompanionLayout() {
  const { t } = useT();
  const { scheme } = useTheme();

  return (
    <Stack screenOptions={headerScreenOptions(scheme)}>
      <Stack.Screen name="index" options={{ title: t("tabCompanion") }} />
      <Stack.Screen name="itinerary" options={{ title: t("planMyTrip") }} />
    </Stack>
  );
}
