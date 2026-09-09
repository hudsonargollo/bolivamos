import { Stack } from "expo-router";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";
import { headerScreenOptions } from "@/lib/header-options";

export default function BoliPassLayout() {
  const { t } = useT();
  const { scheme } = useTheme();

  return (
    <Stack screenOptions={headerScreenOptions(scheme)}>
      <Stack.Screen name="index" options={{ title: t("tabBolipass") }} />
      <Stack.Screen name="subscribe" options={{ title: t("getBolipass") }} />
      <Stack.Screen name="scan" options={{ title: t("redeemNow"), presentation: "fullScreenModal" }} />
    </Stack>
  );
}
