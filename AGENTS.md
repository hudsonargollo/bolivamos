# Bolivamos Agent Instructions

## Project overview

Bolivamos is a pnpm/Turbo monorepo.

- `apps/web`: Next.js 15 App Router deployed to Cloudflare Workers through `@opennextjs/cloudflare`.
- `apps/mobile`: Expo Router mobile app.
- `apps/cron-worker`: Cloudflare Worker for scheduled notifications/emails.
- `packages/*`: shared schema, database, API client, AI, notifications, and design tokens.

## Environment

- Use Node 22 or newer.
- Use pnpm 10.13.1, matching `packageManager` in `package.json`.
- Do not commit secrets. Cloudflare Worker secrets are set with `wrangler secret put`.

## Common commands

Run from the repository root unless noted.

- Install: `pnpm install`
- Build all: `pnpm build`
- Lint all: `pnpm lint`
- Typecheck all: `pnpm typecheck`
- Web build: `pnpm --filter @bolivamos/web build`
- Web deploy: `pnpm --filter @bolivamos/web deploy`
- Cron worker build/typecheck: `pnpm --filter @bolivamos/cron-worker build`
- Cron worker deploy: `pnpm --filter @bolivamos/cron-worker deploy`
- Mobile export build: `pnpm --filter @bolivamos/mobile build`

## Deployment

- Web deployment target is Cloudflare Workers, configured in `apps/web/wrangler.jsonc` as `bolivamos-web`.
- Cron deployment target is Cloudflare Workers, configured in `apps/cron-worker/wrangler.jsonc` as `bolivamos-cron-worker`.
- Production URL in README: `https://bolivamos.clubemkt.digital`.
- Before deploying, run relevant build/typecheck checks and inspect any Cloudflare auth/account errors directly.

## Working rules

- Preserve the existing `master` branch convention unless the user explicitly asks to rename branches.
- Keep app-specific changes inside the relevant app/package.
- Avoid loose files in the repo root unless they document or configure the monorepo.
- Keep `BRANDGUIDE/` assets and design-token changes consistent with `packages/design-tokens`.
- For large UI changes, check both web and mobile package scripts when practical.
