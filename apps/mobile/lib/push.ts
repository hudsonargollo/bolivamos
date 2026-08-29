import * as Notifications from "expo-notifications";
import { apiClient } from "./api";

// Remote push support was pulled from Expo Go in SDK 53+ — both
// setNotificationHandler and the calls in registerForPushNotifications below
// throw there. This module must stay importable in Expo Go regardless (login.tsx
// imports it at the top level), so failures here are swallowed; real push only
// works in a development/production build.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Expo Go (SDK 53+): no remote push support.
}

/** Registers for push and reports the Expo push token to the API (PRD 4.5). */
export async function registerForPushNotifications(): Promise<void> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
    await apiClient.registerPushToken({ expoPushToken });
  } catch {
    // Not available in Expo Go (SDK 53+) or unsupported on this device.
  }
}
