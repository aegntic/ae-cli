# ADR-0004 — Stack: oclif + Hono/Bun + Supabase + QStash + Next.js

**Date:** 2026-07-17
**Status:** Accepted (informed by market-research agent brief, verified competitor pricing)

## Decision
TypeScript end-to-end. One coherent hosted stack, every piece on a free tier sufficient for the hackathon.

| Layer | Pick | Why |
|---|---|---|
| CLI | **oclif v4** | Plugin-shaped catalog (providers = plugins); proven at scale (Heroku/Salesforce CLIs) |
| Gateway | **Hono on Bun** | Fast TS cold start; ESM; edge-portable (Cloudflare, matches aegntic.ai) |
| DB | **Supabase Postgres + pgvector** | Postgres + vector + RLS + auth in one; pgvector powers NL tool discovery |
| Queue | **Upstash QStash** | HTTP-native, built-in idempotency, no Redis to babysit |
| Web | **Next.js 15 App Router** | Three-screen dashboard, ship in a day |
| Billing | **Stripe Checkout + webhooks** | Don't build payments; webhook → ledger row |
| Embeddings | **OpenAI text-embedding-3-small** | Cheap NL search over the tool catalog |
| Deploy | **Cloudflare** (gateway) + **Vercel** (web) | Each on its strength; gateway edge-close to CLI |

## Consequences
- (+) One language (TS), one package manager, shared types across cli/sdk/gateway/web.
- (+) pgvector gives NL discovery without a separate vector DB — that discovery is the moat.
- (−) Bun + Hono newer than Fastify — acceptable swing for the latency/edge story.
- (−) Multiple hosted deps (Supabase, QStash, Stripe, OpenAI) → secrets management discipline required before public flip (ADR-0002 trigger).

## Rejected
- commander/citty for CLI: no plugin model; would reinvent provider discovery.
- Fastify: safe but slower cold start, less edge-friendly.
- Turso/SQLite: no pgvector → NL search needs a second store.
- Raw Redis/BullMQ: more ops than QStash for a hackathon.
