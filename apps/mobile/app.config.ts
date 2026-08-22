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
  plugins: ["expo-router", "expo-secure-store", "expo-camera"],
  extra: {
    router: {
      origin: false,
    },
  },
};

export default config;
