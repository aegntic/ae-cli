# Deploying Aegntic Web to Cloudflare Pages

This app is a Next.js 15 app deployed to Cloudflare Pages using the
[`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) adapter.

## Prerequisites

- Node.js 18.18+ / 20+
- `wrangler` installed (global or via `pnpm dlx`)
- A Cloudflare account with Pages enabled

## Install

```bash
cd apps/web
pnpm install
```

## Build for Pages

```bash
pnpm run pages:build
```

This runs `npx @cloudflare/next-on-pages build`, which produces the
Cloudflare-compatible output in `.vercel/output`.

## Deploy

```bash
wrangler pages deploy .vercel/output --project-name=aegntic-web
```

The project name (`aegntic-web`) and build output dir (`.vercel/output`) are
configured in `wrangler.toml`.

## Local dev (Pages runtime)

```bash
pnpm run pages:dev
```

This serves the app through the Cloudflare Pages runtime locally (use instead of
`next dev` when you need Pages/Workers-specific behavior).

## Preview a production build locally

```bash
pnpm run pages:preview
```

## Environment variables

- `NEXT_PUBLIC_API_URL` — must point to the Aegntic gateway. Set in
  `wrangler.toml` under `[vars]` (currently `https://api.aegntic.ai`). For
  production overrides, set via the Cloudflare dashboard or
  `wrangler pages secret`.

## Version caveats

- `@cloudflare/next-on-pages@^1.13` peer-requires
  `next >=14.3.0 && <=15.5.2`. `package.json` constrains `next` to
  `>=15.1.0 <15.5.3` to stay inside that window.
- Also peers on `wrangler ^3.28.2 || ^4.0.0` and
  `@cloudflare/workers-types ^4.20240208.0` (provided by the adapter at runtime).
- `next.config.ts` is intentionally minimal — next-on-pages handles the build
  transform; do not set `output: "export"`.
