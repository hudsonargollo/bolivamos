import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "BoliVibes",
  slug: "bolivibes",
  owner: "clubemkt",
  scheme: "bolivibes",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.bolivibes.app",
  },
  android: {
    package: "com.bolivibes.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F4EEE2",
    },
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-camera",
    "expo-asset",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#F4EEE2",
      },
    ],
    "expo-web-browser",
    [
      "expo-build-properties",
      {
        // expo-modules-core's Compose Compiler (1.5.15) requires Kotlin 1.9.25
        // exactly; a fresh SDK 52 prebuild otherwise resolves 1.9.24 and fails
        // `:expo-modules-core:compileDebugKotlin`. Pinning it here (rather than
        // hand-editing the gitignored, regenerable android/ project) survives
        // `expo prebuild`.
        android: { kotlinVersion: "1.9.25" },
      },
    ],
  ],
  extra: {
    apiBaseUrl: "https://bolivibes.clubemkt.digital",
    router: {
      origin: false,
    },
    eas: {
      projectId: "53aeb1c6-fe7a-40ec-a105-88272e9dfce8",
    },
  },
  updates: {
    url: "https://u.expo.dev/53aeb1c6-fe7a-40ec-a105-88272e9dfce8",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
};

export default config;
