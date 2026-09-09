import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { decodeSessionUnsafe } from "@bolivamos/api-schema";
import { getStoredToken, hasLikelyValidSession } from "@/lib/auth";

const ONBOARDED_KEY = "bolivamos-onboarded";

type Destination = "/(tabs)/feed" | "/host-redirect" | "/(onboarding)" | "/(auth)/login";

/**
 * Boot screen — decides where to land based on whether a session is already
 * stored, the account's actual role, and whether the onboarding carousel
 * has already been shown once (SecureStore flag, set at the end of
 * app/(onboarding)/privacy.tsx) — matches the prototype's "onboarding shows
 * once" intent, but keyed to a real persisted flag rather than in-memory
 * state, so a returning logged-out user goes straight to sign-in instead of
 * re-watching the intro slides.
 */
export default function Index() {
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    hasLikelyValidSession().then(async (ok) => {
      if (!ok) {
        const onboarded = await SecureStore.getItemAsync(ONBOARDED_KEY);
        setDestination(onboarded ? "/(auth)/login" : "/(onboarding)");
        return;
      }
      const token = await getStoredToken();
      const role = token ? decodeSessionUnsafe(token)?.role : undefined;
      setDestination(role === "host" ? "/host-redirect" : "/(tabs)/feed");
    });
  }, []);

  if (!destination) {
    return (
      <View className="flex-1 items-center justify-center bg-bg-off-white dark:bg-dark-bg">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
