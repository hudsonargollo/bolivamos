/**
 * Canonical BoliVibes design tokens, sourced from the BoliVibes Brand Guide
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
  boliRed: "#C04A2F", // red — decorative/wordmark accent, sun rays (no longer primary CTA)
  boliSage: "#8BA672", // sage — soft fills, sun rays

  // "Clay Maximal" — the terracotta clay-button system, ported verbatim from
  // apps/web/app/admin/admin.css (--a-orange*), which already had it live
  // and tested. Adopted as the new primary CTA color everywhere (mobile-v2
  // reskin, 2026-09), replacing boliRed in that role.
  clayTerracottaLight: "#D0824A",
  clayTerracotta: "#C4703D",
  clayTerracottaDark: "#B4633A",
  clayTerracottaShadow: "#8E4A20",
  claySageLight: "#97B17E",
  claySage: "#7A8A5E",
  claySageDark: "#6F8955",
  claySageShadow: "#55613F",
  clayCharcoalLight: "#4A443C",
  clayCharcoalDark: "#3A352F",
  clayCharcoalShadow: "#1C1A17",
  clayDangerLight: "#D1684A",
  clayDanger: "#B8492E",
  clayDangerDark: "#9C3C25",
  clayDangerShadow: "#6E2415",

  // Neutral palette (Brand Guide v1.0, section 02)
  bgOffWhite: "#F4EEE2", // cream — page background
  paper: "#FDFAF3", // paper — cards and surfaces
  charcoalDark: "#33302C", // ink — text, headlines, primary buttons
  mutedClayGray: "#5B564F", // muted ink — secondary text

  // Pure neutrals used for surfaces/contrast that aren't named in the guide
  white: "#FFFFFF",
  black: "#000000",
} as const;

// Dark-mode palette, additive alongside `colors` (which stays the light
// palette) — values are the mobile-v2 prototype's real `.ph.dark` CSS custom
// properties (the one place this session has verified dark-theme numbers),
// not invented. Consumers pick between `colors`/`darkColors` based on the
// active color scheme (see apps/mobile/lib/use-theme.ts).
export const darkColors = {
  bg: "#1D1A17",
  bg2: "#141210",
  card1: "#2B2723",
  card2: "#241F1B",
  cardShadow: "#0F0D0B",
  ink: "#F5EAD8",
  ink2: "#E8DCC2",
  sub: "#B8A98C",
  muted: "#8A7C63",
} as const;

export const fonts = {
  display: {
    // Was Anton — switched to Caprasimo as part of the mobile-v2 reskin
    // (2026-09), unifying the consumer app with the admin dashboard's
    // already-live Caprasimo headline system instead of running two
    // separate display faces.
    family: "Caprasimo",
    fallback: ["Georgia", "serif"],
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
  xl: 22, // cards (mobile-v2 reskin)
  sheet: 28, // bottom sheets, top corners only
  pill: 999,
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(51,48,44,.10)",
  md: "0 4px 12px rgba(51,48,44,.12)",
  // "Clay" button recipe — inset highlight/shadow rim + a hard drop shadow
  // that collapses on press, ported verbatim from admin.css's .clay-btn
  // (already live/tested there) as part of the mobile-v2 reskin unifying
  // this recipe across surfaces.
  clay: "inset 0 2px 0 rgba(255,246,230,.35), inset 0 -2px 0 rgba(74,36,12,.25), 0 3px 0 #8E4A20, 0 6px 10px rgba(60,35,15,.22)",
  claySage: "inset 0 2px 0 rgba(255,246,230,.3), inset 0 -2px 0 rgba(30,40,15,.22), 0 3px 0 #55613F, 0 6px 10px rgba(40,50,20,.2)",
  clayCharcoal: "inset 0 2px 0 rgba(255,246,230,.2), inset 0 -2px 0 rgba(0,0,0,.3), 0 3px 0 #1C1A17, 0 6px 10px rgba(0,0,0,.25)",
  clayDanger: "inset 0 2px 0 rgba(255,246,230,.3), inset 0 -2px 0 rgba(50,10,5,.3), 0 3px 0 #6E2415, 0 6px 10px rgba(50,15,10,.25)",
} as const;

export const tokens = {
  color: colors,
  darkColor: darkColors,
  font: fonts,
  fontSize: fontSizes,
  space: spacing,
  radius: radii,
  shadow: shadows,
} as const;

export type Tokens = typeof tokens;
