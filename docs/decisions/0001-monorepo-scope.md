# ADR-0001 — Monorepo: the whole business in one repo

**Date:** 2026-07-17
**Status:** Accepted

## Context
ae-cli is not just a CLI. The business = CLI client + gateway API (provider adapters, runs, billing, auth) + web dashboard. Building these as separate repos early fragments shared types (run schema, provider interface, billing models), slows a time-boxed hackathon, and makes "discover → run" end-to-end demos harder.

## Decision
Single monorepo, `aegntic/ae-cli`, holding the entire business surface:
- `packages/cli` — the `aegntic` command
- `packages/sdk` — typed client shared by cli + web
- `services/gateway` — API server
- `apps/web` — dashboard
- `docs/` — PRD, ADRs, roadmap, build-log, content

## Consequences
- (+) One PR can ship a vertical slice (CLI flag + endpoint + dashboard row). Best for demos.
- (+) Shared types stay in lockstep.
- (−) Larger repo; need workspace tooling (pnpm/turbo) discipline.
- (−) Public repo later exposes server code — split billing/provider internals to a private package before that flip (see ADR-0002).

## Alternatives rejected
- Polyrepo: too much overhead for the timeline; shared-schema drift risk.
- CLI-only repo: misses the point — CLI without gateway is a dead client.
