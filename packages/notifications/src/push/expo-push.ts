export interface ExpoPushMessage {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Sends push messages via the Expo Push Notification Service (PRD 4.5).
 * Ticket/receipt reconciliation (retrying DeviceNotRegistered errors, etc.)
 * is out of scope for this scaffold.
 */
export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  const res = await fetch(EXPO_PUSH_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    throw new Error(`Expo push send failed: ${res.status} ${await res.text()}`);
  }
}
