# Deploying Aegntic Web (Vercel) + Gateway (Fly.io)

Web is a Next.js 15 App Router app. It deploys to **Vercel** (native SSR/ISR —
required because `/leaderboard` uses `export const revalidate`, which a static
export would freeze at build time). The gateway stays on **Fly.io**.

> Cloudflare Pages tooling (`@cloudflare/next-on-pages`, `@opennextjs/cloudflare`,
> `wrangler.toml`, `open-next.config.ts`) was removed — Vercel is the target.

## Web → Vercel

1. Import the repo (`aegntic/ae-cli`) at https://vercel.com/new.
   - **Root Directory:** `apps/web`
   - **Build Command:** `next build` (auto-detected)
   - **Output:** Vercel handles it; no `output: "export"`.
2. Set **Environment Variables** (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_AEGNTIC_BASE_URL` → the gateway origin, e.g.
     `https://aegntic-gateway.fly.dev` (or your custom domain).
3. Deploy. `/leaderboard` will render live data via ISR (revalidates every 5 min).

Local check before pushing:

```bash
cd apps/web
pnpm install
NEXT_PUBLIC_AEGNTIC_BASE_URL=http://localhost:3101 pnpm build
```

## Gateway → Fly.io

Config lives in `services/gateway/fly.toml` (`aegntic-gateway`, region `iad`,
health check `GET /health`). Secrets must be set as **Fly secrets**, never in a
committed env file:

```bash
cd services/gateway
fly secrets set \
  DATABASE_URL=postgresql://...            \  # prod Postgres (Supabase per ADR)
  AEGNTIC_LEDGER_SIGNING_SEED=<64 hex>     \  # persistent Ed25519 seed — REQUIRED prod
  CORS_ORIGIN=https://<your-web>.vercel.app \
  STRIPE_SECRET_KEY=sk_live_...            \
  STRIPE_WEBHOOK_SECRET=whsec_...          \
  AEGNTIC_APIFY_TOKEN=apify_api_...
fly deploy
```

Verify after deploy:

```bash
curl -i https://aegntic-gateway.fly.dev/health       # → 200 { status: "ok" }
curl -i https://aegntic-gateway.fly.dev/leaderboard   # → 200, no auth, real stats
```

## Required env summary

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_AEGNTIC_BASE_URL` | Vercel (web) | Gateway origin for browser + RSC fetch |
| `DATABASE_URL` | Fly (gateway) | Prod Postgres |
| `AEGNTIC_LEDGER_SIGNING_SEED` | Fly (gateway) | Persistent Ed25519 ledger key (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `CORS_ORIGIN` | Fly (gateway) | Web origin allowed by CORS |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Fly (gateway) | Billing + webhook signature |
| `AEGNTIC_APIFY_TOKEN` | Fly (gateway) | Apify provider (rotate pre-launch) |
