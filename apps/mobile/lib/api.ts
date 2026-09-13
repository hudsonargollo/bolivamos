import Constants from "expo-constants";
import { ApiClient } from "@bolivibes/api-client";
import { getStoredToken } from "./auth";

export const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "https://bolivibes.clubemkt.digital";

export const isLocalApi = /localhost|127\.0\.0\.1|10\.0\.2\.2/.test(baseUrl);

export const apiClient = new ApiClient({
  baseUrl,
  getToken: getStoredToken,
});
