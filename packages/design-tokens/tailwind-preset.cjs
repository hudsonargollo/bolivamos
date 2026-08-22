/**
 * Plain-CommonJS mirror of ./src/tailwind-preset.ts, used specifically by
 * tailwind.config.js files (apps/web, apps/mobile) — Tailwind's config
 * loader runs under plain Node and can't reliably parse a workspace
 * package's TypeScript source at require-time. Keep these values in sync
 * with ./src/tokens.ts if the palette/fonts/radii/shadows ever change.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        "boli-green": "#0B5D39",
        "boli-orange": "#E07A2A",
        "boli-yellow": "#E5B824",
        "boli-red": "#C83727",
        "bg-off-white": "#F7F5EE",
        "charcoal-dark": "#1E1E1E",
        "muted-clay-gray": "#4A4A4A",
      },
      fontFamily: {
        display: ["Bebas Neue", "Impact", "sans-serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: { sm: "4px", md: "8px", lg: "16px", pill: "999px" },
      boxShadow: {
        sm: "0 1px 2px rgba(30,30,30,.10)",
        md: "0 4px 12px rgba(30,30,30,.12)",
      },
    },
  },
};
