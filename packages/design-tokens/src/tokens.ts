/**
 * Canonical BoliVamos design tokens, sourced from the Bolivamos Brand Guide
 * v1.0 (the sun-mark identity). This is the single source of truth — the
 * Tailwind preset (web) and the NativeWind preset (mobile) are both
 * generated from these values. Do not hand-edit derived files; edit this
 * one, then mirror color/font changes into ./tailwind-preset.cjs.
 */

export const colors = {
  // Sun colors — brand accents (Brand Guide v1.0, section 02)
  boliGreen: "#2F5D3E", // deep green — secondary actions, links, footer
  boliOrange: "#E2792F", // orange — VAMOS, highlight tags
  boliYellow: "#E3A52F", // yellow — Free tag, sun rays
  boliRed: "#C04A2F", // red — headlines, primary button, times
  boliSage: "#8BA672", // sage — soft fills, sun rays

  // Neutral palette (Brand Guide v1.0, section 02)
  bgOffWhite: "#F4EEE2", // cream — page background
  paper: "#FDFAF3", // paper — cards and surfaces
  charcoalDark: "#33302C", // ink — text, headlines, primary buttons
  mutedClayGray: "#5B564F", // muted ink — secondary text

  // Pure neutrals used for surfaces/contrast that aren't named in the guide
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const fonts = {
  display: {
    family: "Anton",
    fallback: ["Impact", "sans-serif"],
  },
  body: {
    family: "Archivo",
    fallback: ["Helvetica", "Arial", "sans-serif"],
  },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  "2xl": 40,
  "3xl": 56,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(51,48,44,.10)",
  md: "0 4px 12px rgba(51,48,44,.12)",
} as const;

export const tokens = {
  color: colors,
  font: fonts,
  fontSize: fontSizes,
  space: spacing,
  radius: radii,
  shadow: shadows,
} as const;

export type Tokens = typeof tokens;
