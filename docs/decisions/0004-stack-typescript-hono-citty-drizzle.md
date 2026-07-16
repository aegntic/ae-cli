# ADR-0004 — Stack: TypeScript end-to-end, Hono gateway, citty CLI, Drizzle + Postgres

**Date:** 2026-07-17
**Status:** Accepted

## Context
PRD open questions: CLI framework, backend, DB, queue, provider strategy. Hackathon timeline demands fastest path to `discover → run → poll` demo. Must be deployable to edge/cloud with minimal config.

## Decision

| Layer | Pick | Rationale |
|-------|------|-----------|
| Monorepo | pnpm workspaces + turborepo | Fastest builds, native workspace support, zero-config caching |
| CLI | citty (UnJS) | ESM-native, zero-dep, tiny bundle, used by Nitro/Nuxt ecosystem |
| Gateway | Hono | Fastest HTTP framework, edge-native (CF Workers, Bun, Node), great TS DX |
| SDK | Pure TypeScript | Shared types + fetch wrapper. No framework. Zero runtime deps |
| Database | PostgreSQL (Supabase) + Drizzle ORM | Type-safe queries, migrations, edge-compatible, generous free tier |
| Queue | DB polling (P1), BullMQ (P2+) | Simple first; upgrade when async needs grow |
| Web | Next.js 14 (App Router) + Tailwind + shadcn/ui | Best landing page + dashboard DX, Vercel deploy in one click |
| Auth | API key hash (argon2) for CLI; better-auth for web dashboard | Keys for agents; magic-link for humans |
| Deploy | Vercel (web) + Fly.io (gateway) + Supabase (DB) | Each best-in-class, all free-tier friendly |

## Consequences
- (+) TypeScript everywhere — one language, shared types, no serialization boundary bugs
- (+) Hono runs anywhere — swap from Node to Bun to CF Workers without rewrite
- (+) citty is minimal — fast startup, clean help output, ESM-only (matches modern agents)
- (+) Drizzle generates types from schema — no ORM magic, raw SQL power when needed
- (+) Supabase free tier covers hackathon DB needs with Postgres + auth + storage
- (−) ESM-only CLI may friction with legacy Node setups — acceptable (agents use modern runtimes)
- (−) Hono less battle-tested than Express at scale — acceptable for hackathon; migration path clear

## Alternatives rejected
- **oclif**: Heavy, class-based, slower startup. Overkill for 6 commands.
- **Fastify**: Node-only, heavier than Hono. No edge deploy story.
- **Prisma**: Heavier runtime, generated client bloat. Drizzle is leaner.
- **SQLite/Turso**: Insufficient for concurrent runs + billing. Postgres is the right DB.
- **Commander.js**: CJS-first, no built-in type safety. citty is the modern choice.
- **BullMQ from day 1**: Redis dependency adds infra complexity. DB polling ships the demo.
