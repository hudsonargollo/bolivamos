import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "BoliVamos",
  slug: "bolivamos",
  scheme: "bolivamos",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#F7F5EE",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.bolivamos.app",
  },
  android: {
    package: "com.bolivamos.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F7F5EE",
    },
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-camera",
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
    router: {
      origin: false,
    },
  },
};

export default config;
