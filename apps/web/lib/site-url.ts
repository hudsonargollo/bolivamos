// Single production environment (no staging block in wrangler.jsonc), so
// this is a plain constant rather than a wrangler var — keeps it usable from
// the root layout's static `metadata` export without forcing an async
// generateMetadata() (which would mark the whole app dynamic).
export const SITE_URL = "https://bolivibes.clubemkt.digital";
