-- 0001: tamper-evident signed ledger chain (ruvos port; additive on worktree-p2)
-- Adds hash-chain + Ed25519 signature columns to balance_ledger. All new
-- columns are NULLABLE so existing pre-migration rows remain valid without a
-- backfill (they are treated as the unsigned genesis epoch; only rows
-- inserted after this migration carry chain fields). New signed inserts
-- always supply the chain columns via appendLedgerEntry(); the NULLables
-- exist purely so the ALTER does not need to rewrite or default-fill history.
--
-- Source: feat/aegntic-live `drizzle/0001_signed_chain.sql`, adapted to p2's
-- `balance_ledger` shape (numeric amount, run_id, reason, currency) and to
-- p2's `runs` table (feat/aegntic-live has `jobs` — result_hash lands on
-- runs.result_hash here, kept nullable and unused in this phase; binding
-- itemCount / result_hash into the signed payload is Phase 4, out of scope).

ALTER TABLE "balance_ledger"
  ADD COLUMN IF NOT EXISTS "prev_hash" text,
  ADD COLUMN IF NOT EXISTS "payload_hash" text,
  ADD COLUMN IF NOT EXISTS "signature_algo" text,
  ADD COLUMN IF NOT EXISTS "signature" text,
  ADD COLUMN IF NOT EXISTS "signer_public_key" text;

-- Runs: bind each run to the signed charge entry by its result hash.
-- Nullable; populated by a future phase that signs result content.
ALTER TABLE "runs"
  ADD COLUMN IF NOT EXISTS "result_hash" text;
