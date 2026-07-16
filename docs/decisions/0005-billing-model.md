# ADR-0005 — Billing: prepaid balance, per-result metering, 25% markup, append-only ledger

**Date:** 2026-07-17
**Status:** Accepted

## Decision
- **Prepaid balance** (integer cents), topped up via Stripe Checkout.
- **Per-result metering** as primary: `cost = result_count × tool.unit_cost_cents × (1 + markup)`. Per-call fallback for non-countable tools.
- **Markup: 25%** — matches RapidAPI rev-share floor, defensible, easy to explain on stage.
- **Free tier: $5 credit on signup, no card** (direct Apify riposte, cross-provider).
- **Ledger is append-only.** Balance = `SUM(delta_cents)`. Refund = negative charge row tied to `job_id`. Never mutate.
- **Transparency:** dashboard shows `provider_cost` and `aegntic_fee` separately — the wedge vs opaque competitors.

## Cost lifecycle per run
1. QUEUED: reserve estimated cost (soft, in-memory/preview only).
2. RUNNING: no ledger change.
3. COMPLETED: append `charge` = actual `result_count × unit_cost × 1.25`.
4. FAILED: append `refund` = $0 charge (nothing billed) + optional retry credit.

## Invariants (enforced by tests, silent-failure-hunter, database-reviewer)
- Balance never goes negative (reserve-and-settle; reject run if balance < estimate).
- Ledger is append-only; no UPDATE/DELETE on ledger rows.
- Every charge row links a `job_id` + `provider` + `units` + `unit_cost_cents`.
- Idempotency: re-POST same run → same job, no double-charge.

## Consequences
- (+) Mirrors Apify PPE / PDL per-match — value-aligned, predictable.
- (+) Append-only ledger = auditable, trivial balance recomputation, replay-safe.
- (−) Refund logic must be deliberate — flagged for silent-failure-hunter + tdd-guide before ship.
