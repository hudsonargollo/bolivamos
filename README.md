# BoliVibes

Monorepo for the BoliVibes app (Santa Cruz de la Sierra, Bolivia) — live at
[bolivibes.clubemkt.digital](https://bolivibes.clubemkt.digital).

- `apps/web` — Next.js 15 App Router, deployed to Cloudflare Workers via `@opennextjs/cloudflare`.
  Hosts the public site and API, the Host Portal (`/host/*`), the Admin Dashboard (`/admin/*`),
  and the VIP consumer surfaces: AI Concierge (`/concierge`), the tours/tickets Marketplace
  (`/marketplace`), and VIP Connect & Dating (`/connect`).
- `apps/mobile` — Expo Router app (iOS/Android). Auth, event browsing, and push registration are
  live; Concierge/Marketplace/Connect parity with web is in progress (see "Mobile parity" below).
- `apps/cron-worker` — plain Cloudflare Worker running scheduled email/notification jobs.
- `packages/*` — shared design tokens, D1 schema (Drizzle), Zod API contracts + JWT/KV helpers,
  the Gemini AI wrapper, notification senders, and the mobile API client.

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

Apply the D1 migrations locally:

```bash
pnpm db:migrate:local
```

Run everything:

```bash
pnpm dev            # web + mobile + cron-worker, via turbo
pnpm dev:web         # just the Next.js API/Host Portal/Admin
pnpm dev:mobile      # just Expo
```

With `DEV_MODE_MOCK_AUTH=true` in `apps/web/.dev.vars`, the mobile app's "Continue as test user (dev only)" button and `POST /api/auth/dev-login` let you exercise every protected route without real Google OAuth credentials.

## Admin Dashboard (`/admin/*`)

Full control center for internal staff (e.g. Steff), on-brand with the public site:

- **Users** — roles, BoliPass VIP status
- **Venues / Events / Vouchers / Places** — full CRUD across every host, category filters, a verify workflow on Places, `isVipOnly`/`featured` flags on venues and events
- **Push** — compose and send a campaign (Everyone / VIP / Hosts) over the real Expo push pipeline
- **Products / Payment Methods / Orders** — manage the tours/audio-tours/tickets marketplace, the QR Bolivia/PIX/crypto receiving details buyers see at checkout, and manually confirm non-Stripe orders
- **Moderation** — VIP Connect reports; dismiss or ban (a ban kills that user's session everywhere, immediately)
- **Analytics** — signups, VIP conversion, redemptions, concierge/connect/push engagement, marketplace revenue by month, a churn proxy, and an MRR/ARR projection (admin-set BoliPass price × active VIPs — a labeled estimate, not real billing data)

There is no self-signup or in-app path to the `admin` role — it can only be granted with a direct DB update, after the person has signed up (or dev-logged-in) once as a normal user:

```bash
pnpm --filter @bolivibes/web exec wrangler d1 execute bolivamos-db --local \
  --command "UPDATE users SET role='admin' WHERE email='REPLACE_WITH_EMAIL'"
```

Drop `--local` to run it against the remote/production database. Log out and back in afterwards so the session picks up the new role.

## One-time Cloudflare setup

D1/KV are already created and wired into `apps/web/wrangler.jsonc` and `apps/cron-worker/wrangler.jsonc` for this deployment. Standing these up fresh elsewhere:

```bash
pnpm --filter @bolivibes/web exec wrangler d1 create bolivamos-db
pnpm --filter @bolivibes/web exec wrangler kv namespace create bolivibes-kv
pnpm --filter @bolivibes/web exec wrangler kv namespace create bolivibes-kv --preview

pnpm db:migrate:remote
```

Then set secrets (never committed) on both Workers:

```bash
pnpm --filter @bolivibes/web exec wrangler secret put JWT_SECRET
pnpm --filter @bolivibes/web exec wrangler secret put GOOGLE_CLIENT_SECRET
pnpm --filter @bolivibes/web exec wrangler secret put GEMINI_API_KEY
pnpm --filter @bolivibes/web exec wrangler secret put RESEND_API_KEY
pnpm --filter @bolivibes/web exec wrangler secret put STRIPE_SECRET_KEY
pnpm --filter @bolivibes/web exec wrangler secret put STRIPE_WEBHOOK_SECRET

pnpm --filter @bolivibes/cron-worker exec wrangler secret put JWT_SECRET
pnpm --filter @bolivibes/cron-worker exec wrangler secret put RESEND_API_KEY
```

`JWT_SECRET` must be identical across `apps/web` and `apps/cron-worker`.

## Google OAuth setup

Create OAuth client IDs in Google Cloud Console for Web, iOS, and Android, then set:
- `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID` as plain `vars` in `apps/web/wrangler.jsonc` and as `EXPO_PUBLIC_GOOGLE_*` in `apps/mobile/.env`.
- `GOOGLE_CLIENT_SECRET` as a Worker secret on `apps/web` only.

Email/password login (`/login`) works independently of this and doesn't need OAuth configured.

## What's built but waiting on a credential or setting

All of the following is deployed and functional — it just doesn't do anything real yet:

- **Stripe checkout** — real Checkout Session + webhook integration; needs `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`.
- **AI Concierge replies** — the Gemini key is real but its prepayment credits are depleted; top up billing at [ai.studio](https://ai.studio).
- **Google sign-in** — needs `GOOGLE_CLIENT_SECRET` (see above).
- **Weekly digest / weekend roundup emails** — needs `RESEND_API_KEY`.
- **QR Bolivia / QR PIX / crypto checkout** — the flow works end-to-end once an admin fills in the receiving QR/address at `/admin/payment-methods`; empty today.
- **MRR/ARR projection** — needs a BoliPass price set on the Analytics page.

## What's stubbed / explicitly out of scope

- Real BoliPass payment integration — activation still flips a flag, no checkout for the pass itself.
- A real QR Bolivia / PIX gateway integration (today's flow is admin-confirmed, not automated) — needs a specific bank/PSP chosen first.
- Audio tour content pipeline (asset upload/hosting) — the `audio_tour` product type exists, uploading doesn't yet.
- True geofenced/location-triggered push — today's campaigns are broadcast-to-a-segment; no mobile-side location tracking exists.
- Real-time messaging for VIP Connect — messages currently refresh by polling, not sockets.
- Multi-admin management UI — new admins are still promoted by hand via direct DB command.
- `redemptions.saved_amount_bob` is accepted as a client-reported request param — there's no menu/ticket price data in the schema to derive it from.
- No CI/CD beyond lint/typecheck.

## Mobile parity

`apps/mobile` has auth (Google + email/password + dev-login), event browsing, and push token
registration. The AI Concierge, Marketplace, and VIP Connect & Dating screens that exist on web
don't have mobile equivalents yet — that's the current focus.
