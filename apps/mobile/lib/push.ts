import * as Notifications from "expo-notifications";
import { apiClient } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Registers for push and reports the Expo push token to the API (PRD 4.5). */
export async function registerForPushNotifications(): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
  await apiClient.registerPushToken({ expoPushToken });
}
