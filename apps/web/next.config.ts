import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@bolivamos/design-tokens",
    "@bolivamos/db",
    "@bolivamos/api-schema",
    "@bolivamos/ai",
    "@bolivamos/notifications",
  ],
};

// Enables `env` bindings (D1/KV/etc.) to be available in `next dev`, not just
// in `opennextjs-cloudflare preview`/deploy.
initOpenNextCloudflareForDev();

export default nextConfig;
