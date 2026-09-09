import { Stack } from "expo-router";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";
import { headerScreenOptions } from "@/lib/header-options";

export default function ConnectLayout() {
  const { t } = useT();
  const { scheme } = useTheme();

  return (
    <Stack screenOptions={headerScreenOptions(scheme)}>
      <Stack.Screen name="index" options={{ title: t("connect") }} />
      <Stack.Screen name="[requestId]" options={{ title: t("connect") }} />
    </Stack>
  );
}
