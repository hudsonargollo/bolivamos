/// <reference types="@cloudflare/workers-types" />
// Placeholder — regenerate with `pnpm --filter @bolivamos/web run cf-typegen`
// once the D1/KV bindings below are created and wired into wrangler.jsonc.
// That command overwrites this file with the real `CloudflareEnv` interface.
interface CloudflareEnv {
  DB: D1Database;
  BOLIVAMOS_KV: KVNamespace;
  JWT_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_WEB_CLIENT_ID: string;
  GOOGLE_IOS_CLIENT_ID: string;
  GOOGLE_ANDROID_CLIENT_ID: string;
  GEMINI_API_KEY: string;
  RESEND_API_KEY: string;
  DEV_MODE_MOCK_AUTH?: string;
}
