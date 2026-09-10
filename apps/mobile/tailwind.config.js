const tailwindPreset = require("@bolivibes/design-tokens/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset"), tailwindPreset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // React Native matches font families by exact loaded name, not CSS
      // cascade — override the shared preset's web-style names
      // ("Caprasimo", "Archivo") with the literal keys registered via
      // useFonts in app/_layout.tsx.
      fontFamily: {
        display: ["Caprasimo_400Regular"],
        body: ["Archivo_400Regular"],
      },
    },
  },
};
