import * as SecureStore from "expo-secure-store";

export type DefaultVisibility = "everyone" | "friends" | "ghost";

const VISIBILITY_KEY = "bolivibes-default-visibility";

/**
 * Set once during onboarding's privacy step. The real backend has no global
 * "invisible everywhere" setting — only a per-event eventAttendance.visible
 * flag (see apps/web/app/api/events/[id]/attendance/route.ts). This value is
 * used ONLY as the default the per-event "I'm going — show me" toggle starts
 * at (apps/mobile/app/(tabs)/feed/[id].tsx) — it doesn't itself hide/show
 * anyone. Keeping this honest is the whole point of storing it locally
 * instead of pretending it's a real server-side privacy control.
 */
export async function getDefaultVisibility(): Promise<DefaultVisibility> {
  const stored = await SecureStore.getItemAsync(VISIBILITY_KEY);
  if (stored === "everyone" || stored === "friends" || stored === "ghost") return stored;
  return "friends";
}

export async function setDefaultVisibility(value: DefaultVisibility): Promise<void> {
  await SecureStore.setItemAsync(VISIBILITY_KEY, value);
}

/** Whether the default per-event visibility toggle should start checked. */
export function visibilityDefaultsToVisible(value: DefaultVisibility): boolean {
  return value !== "ghost";
}
