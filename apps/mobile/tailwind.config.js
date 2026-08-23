const tailwindPreset = require("@bolivamos/design-tokens/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset"), tailwindPreset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};
