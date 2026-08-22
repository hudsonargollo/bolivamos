import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Typed accessor for this Worker's bindings (D1, KV, vars, secrets). `env`'s
 * type comes from the ambient global `CloudflareEnv` interface declared in
 * cloudflare-env.d.ts, merged with @opennextjs/cloudflare's own built-in
 * fields — no generic type argument needed here (that parameter is for the
 * request's `cf` properties, not `env`).
 */
export function cf() {
  return getCloudflareContext();
}
