import { useCallback, useEffect, useState } from "react";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "bolivamos-color-scheme";
type Scheme = "light" | "dark";

/**
 * Thin wrapper around NativeWind's useColorScheme() — that hook alone only
 * reflects the OS setting on each fresh app launch, with no persistence of
 * an explicit in-app choice (Profile's light/dark toggle) across restarts.
 * This adds a persisted override, read once on mount and applied via
 * setColorScheme() — same storage mechanism as this app's other local
 * preference (see lib/auth.ts's token storage), not a new dependency.
 */
export function useTheme() {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored: string | null) => {
        if (stored === "light" || stored === "dark") setColorScheme(stored);
      })
      .finally(() => setReady(true));
    // Only ever reads the stored override once, at boot — setColorScheme is
    // stable across renders per NativeWind's implementation.
  }, []);

  const setScheme = useCallback(
    (scheme: Scheme) => {
      setColorScheme(scheme);
      SecureStore.setItemAsync(STORAGE_KEY, scheme).catch(() => undefined);
    },
    [setColorScheme],
  );

  return { scheme: (colorScheme ?? "light") as Scheme, setScheme, ready };
}
