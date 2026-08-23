import Constants from "expo-constants";
import { ApiClient } from "@bolivamos/api-client";
import { getStoredToken } from "./auth";

export const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:8787";

export const apiClient = new ApiClient({
  baseUrl,
  getToken: getStoredToken,
});
