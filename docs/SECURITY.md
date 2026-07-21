# Security — launch gate & threat notes

This document is the pre-public-flip security posture for the aedex gateway
(`services/gateway`). It records what is hardened, what is intentionally
deferred, and the open checklist before the repo flips public (ADR-0002).

## Launch gate (must be green before public flip)

- [x] **No secrets in git.** `gitleaks`-equivalent scan clean (2026-07). The
  Apify token lives only in the untracked `services/gateway/.env`; confirmed
  absent from tracked files and full history (`git log -S`).
- [x] **`.env` gitignored.** `services/gateway/.env` is ignored; prod secrets
  go to `fly secrets`.
- [x] **Stripe webhook signature verified.** `routes/stripe.ts` rejects any
  webhook whose `Stripe-Signature` fails `constructEventAsync` against
  `STRIPE_WEBHOOK_SECRET`.
- [x] **Auth boundary enforced.** Every `/v1/*` route runs `authMiddleware`
  (Bearer token → `lookupWorkspaceByToken`). `/leaderboard` and the Stripe
  webhook are the only public routes, by design.
- [x] **Billing integrity.** Append-only ledger, derived balance (no mutable
  column), Ed25519 hash-chain (`GET /v1/balance/audit`), and the sacred
  failed-run-no-charge invariant.
- [x] **Idempotent run creation.** `POST /v1/runs` dedupes on the optional
  `Idempotency-Key` header (see `store.createRun`) — safe to retry.
- [x] **Rate limiting.** Per-workspace fixed window on `/v1/*`
  (`middleware/ratelimit.ts`, 120 req/min). In-memory; single-replica only.
- [x] **CORS restricted.** `cors({ origin: CORS_ORIGIN })`; default is the dev
  server, prod is the Vercel web URL.
- [ ] **Rotate the Apify token** before public flip (hygiene; it is not leaked).
- [ ] **Provision prod `AEGNTIC_LEDGER_SIGNING_SEED`** — without it the signed
  ledger uses an ephemeral key and audit fails across restarts.
- [ ] **Run `gitleaks` / `trufflehog`** in CI before the flip.

## SSRF posture

Provider adapters fetch **hardcoded** upstream endpoints only — no caller-
controlled URL reaches `fetch`. The registry
(`src/providers/registry.ts` + `src/adapters/`) maps a known `provider` +
`endpoint` pair to a fixed URL template; user input is bound into query
parameters, never into the host. Each adapter sets an `AbortSignal` timeout.
**Risk: low.** The only way to introduce an arbitrary-host fetch would be a new
adapter that reads a URL from tool input — none do today; review any such
adapter before merging.

## Known limitations (accepted pre-scale)

- Rate limiting is in-memory and per-replica. Correct while Fly runs a single
  machine (`auto_stop_machines=true`). Move to Redis when scaling out.
- The `/v1/*` workspace lookup uses the raw token via `lookupWorkspaceByToken`
  (SHA-256 hash compare in the store). Constant-time compare is a future
  hardening step; timing attack surface is low given per-key rate limiting.
- Concurrent-run overdraft is a documented billing limitation (hold/release
  ledger entries are the planned fix) — see `store.ts` header comment.
