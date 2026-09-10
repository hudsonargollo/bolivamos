/// <reference types="@cloudflare/workers-types" />
// Placeholder — regenerate with `pnpm --filter @bolivibes/web run cf-typegen`
// once the D1/KV bindings below are created and wired into wrangler.jsonc.
// That command overwrites this file with the real `CloudflareEnv` interface.
interface CloudflareEnv {
  DB: D1Database;
  BOLIVIBES_KV: KVNamespace;
  EVENT_ASSETS: R2Bucket;
  IMAGES: ImagesBinding;
  JWT_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_WEB_CLIENT_ID: string;
  GOOGLE_IOS_CLIENT_ID: string;
  GOOGLE_ANDROID_CLIENT_ID: string;
  GEMINI_API_KEY: string;
  RESEND_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  DEV_MODE_MOCK_AUTH?: string;
}
