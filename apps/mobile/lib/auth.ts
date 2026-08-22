import * as SecureStore from "expo-secure-store";
import { decodeSessionUnsafe } from "@bolivamos/api-schema";

const TOKEN_KEY = "bv_auth_token";

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Unverified local expiry check — lets the app proactively bounce to /login
 * before firing an obviously-stale request. The Worker is the sole source
 * of truth for whether a token is actually still valid/authorized.
 */
export async function hasLikelyValidSession(): Promise<boolean> {
  const token = await getStoredToken();
  if (!token) return false;
  const payload = decodeSessionUnsafe(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return payload.exp * 1000 > Date.now();
}
