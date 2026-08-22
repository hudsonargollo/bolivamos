import type { ExpoPushMessage } from "./expo-push";

export interface NearbyVenueAlert {
  expoPushToken: string;
  venueName: string;
  venueId: string;
}

/**
 * Geolocation alerts when a user is near an active BoliPass partner (PRD
 * 4.5). Actual proximity computation (geofence radius, dedup/cooldown so the
 * same user isn't spammed) is out of scope for this scaffold — this just
 * shapes the alert already-identified-as-nearby into a push message.
 */
export function buildNearbyVenueAlert(alert: NearbyVenueAlert): ExpoPushMessage {
  return {
    to: alert.expoPushToken,
    title: "You're near a BoliPass partner!",
    body: `${alert.venueName} has an active 2-for-1 offer nearby.`,
    data: { venueId: alert.venueId },
  };
}
