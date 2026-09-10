import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@bolivibes/design-tokens",
    "@bolivibes/db",
    "@bolivibes/api-schema",
    "@bolivibes/ai",
    "@bolivibes/notifications",
  ],
};

// Enables `env` bindings (D1/KV/etc.) to be available in `next dev`, not just
// in `opennextjs-cloudflare preview`/deploy.
initOpenNextCloudflareForDev();

export default nextConfig;
