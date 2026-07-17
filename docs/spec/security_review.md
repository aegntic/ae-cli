# Security Review — aegntic Gateway & CLI

This document outlines the security audit and validation performed on the aegntic gateway, SDK, and CLI packages prior to shipping the P1 vertical slice.

## Threat Modeling & Mitigations

### 1. API Key Authentication & Storage
* **Threat**: Database breach leaking raw customer API keys, enabling unauthorized tool execution and billing theft.
* **Mitigation**:
  * API keys are hashed at rest using **Argon2id** (via `argon2` npm package), which is resistant to GPU-based cracking attacks.
  * Only the key prefix (`aegntic_live_...` first 20 characters) is stored in plaintext to index lookup and avoid full-table scans.
  * During request verification, we fetch only keys matching the prefix, then perform a constant-time Argon2 verification.

### 2. SQL Injection
* **Threat**: Malicious input in queries or header values executing arbitrary database commands.
* **Mitigation**:
  * Drizzle ORM is used end-to-end. All queries are parameterized by default.
  * No raw string interpolation is used in query builder statements.

### 3. Double-Charging & Idempotency
* **Threat**: Network retry causing double execution of third-party scrapers and double-billing of workspace balances.
* **Mitigation**:
  * The gateway checks for the `Idempotency-Key` header on all POST execution routes.
  * Runs are recorded with their `idempotencyKey` scoped to the authenticated `workspaceId`.
  * If a run with the same key is already present, the existing run state/result is returned without creating a new job or billing ledger transaction.

### 4. Billing Ledger Invariants
* **Threat**: Race conditions causing negative workspace balances or database updates modifying history.
* **Mitigation**:
  * Workspace balance is calculated dynamically by summing transaction deltas (`sum(balance_ledger.delta_cents)`), making the balance ledger strictly append-only.
  * No update or delete operations are permitted on `balance_ledger` rows.
  * Estimates are checked prior to execution. If `balance < estimated_cost`, execution is blocked and a terminal `BLOCKED` job is recorded.

## Compliance Checklist

- [x] No hardcoded secrets in codebase or commits
- [x] Input parameters (provider, endpoint) validated at route entrypoints
- [x] Parameterized SQL statements used for all lookups
- [x] In-memory timing attacks mitigated using Argon2
- [x] Workspace boundary validation on job and key actions
