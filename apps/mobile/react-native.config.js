// Works around an autolinking bug on this Expo SDK 52 / RN 0.76.9 / Gradle 8.10.2
// combination: the generator derives PackageList.java's import for "expo" from its
// Gradle module namespace ("expo.core", used only for R/BuildConfig codegen) instead
// of honoring the "expo" package's own react-native.config.js packageImportPath,
// which correctly points at the real class location, expo.modules.ExpoModulesPackage.
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: {
          packageImportPath: 'import expo.modules.ExpoModulesPackage;',
        },
      },
    },
  },
};
