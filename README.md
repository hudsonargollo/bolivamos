# BoliVamos

Monorepo for the BoliVamos mobile app and BoliPass Club (Santa Cruz de la Sierra, Bolivia).

- `apps/web` — Next.js 15 App Router, deployed to Cloudflare Workers via `@opennextjs/cloudflare`. Hosts the public API and the Host Portal (`/host/*`).
- `apps/mobile` — Expo Router app (iOS/Android).
- `apps/cron-worker` — plain Cloudflare Worker running scheduled email/notification jobs.
- `packages/*` — shared design tokens, D1 schema (Drizzle), Zod API contracts + JWT/KV helpers, the Gemini AI wrapper, notification senders, and the mobile API client.

This is a scaffold: every architectural seam (auth, D1 schema, KV bindings, AI call boundary, cron triggers) is wired up, but no real Cloudflare resources, Google OAuth credentials, or payment processing are configured yet. See "What's stubbed" below.

## Prerequisites

- Node 22 (see `.nvmrc`)
- pnpm 10 (`corepack enable` or `npm i -g pnpm@10.13.1`)
- A Cloudflare account (for D1/KV/deploy — not required for local dev with `DEV_MODE_MOCK_AUTH`)

## Local setup

```bash
pnpm install
cp .env.example apps/web/.dev.vars        # then fill in JWT_SECRET at minimum
cp .env.example apps/cron-worker/.dev.vars
cp .env.example apps/mobile/.env          # EXPO_PUBLIC_* vars only
```

Apply the D1 migration locally:

```bash
pnpm db:migrate:local
```

Run everything:

```bash
pnpm dev            # web + mobile + cron-worker, via turbo
pnpm dev:web         # just the Next.js API/Host Portal
pnpm dev:mobile      # just Expo
```

With `DEV_MODE_MOCK_AUTH=true` in `apps/web/.dev.vars`, the mobile app's "Continue as test user (dev only)" button and `POST /api/auth/dev-login` let you exercise every protected route without real Google OAuth credentials.

## One-time Cloudflare setup (not done by this scaffold)

Run these before deploying, then paste the resulting IDs into `apps/web/wrangler.jsonc` and `apps/cron-worker/wrangler.jsonc`:

```bash
pnpm --filter @bolivamos/web exec wrangler d1 create bolivamos-db
pnpm --filter @bolivamos/web exec wrangler kv namespace create bolivamos-kv
pnpm --filter @bolivamos/web exec wrangler kv namespace create bolivamos-kv --preview

pnpm db:migrate:remote
```

Then set secrets (never committed) on both Workers:

```bash
pnpm --filter @bolivamos/web exec wrangler secret put JWT_SECRET
pnpm --filter @bolivamos/web exec wrangler secret put GOOGLE_CLIENT_SECRET
pnpm --filter @bolivamos/web exec wrangler secret put GEMINI_API_KEY
pnpm --filter @bolivamos/web exec wrangler secret put RESEND_API_KEY

pnpm --filter @bolivamos/cron-worker exec wrangler secret put JWT_SECRET
pnpm --filter @bolivamos/cron-worker exec wrangler secret put RESEND_API_KEY
```

`JWT_SECRET` must be identical across `apps/web` and `apps/cron-worker`.

## Google OAuth setup (not done by this scaffold)

Create OAuth client IDs in Google Cloud Console for Web, iOS, and Android, then set:
- `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID` as plain `vars` in `apps/web/wrangler.jsonc` and as `EXPO_PUBLIC_GOOGLE_*` in `apps/mobile/.env`.
- `GOOGLE_CLIENT_SECRET` as a Worker secret on `apps/web` only.

## What's stubbed / explicitly out of scope

- Gemini prompts (itinerary/chat/highlight) are minimal placeholders, not tuned.
- Google OAuth is wired but untestable without real client IDs — use `dev-login` until then.
- No Cloudflare resources are created yet — `wrangler.jsonc` has `REPLACE_WITH_*` placeholders.
- No push delivery/geofencing, Resend templates, or BoliPass payment processing.
- `redemptions.saved_amount_bob` is accepted as a client-reported request param — there's no menu/ticket price data in the schema to derive it from.
- No shared cross-platform UI kit, no CI/CD beyond lint/typecheck, no EAS builds run.

See the plan doc from the scaffolding session for the full rationale behind these calls.
