# YouTube Script — Checkpoint 3: Console

**Length:** ~2-3 min. **Goal:** show the web console rendering live gateway data, and the two lessons it forced (partial-failure resilience, per-worktree DB isolation).

---

## [0:00] Cold open

> The CLI was the product. Now it has a face.

**Visual:** browser, `http://localhost:3000/app`, dark console. Title card: "Checkpoint 3: Console."

## [0:10] The gate

> Paste a workspace key. It lives in the browser; the gateway mints it.

**Visual:** type `aegntic_test_key_123`, click Connect.

## [0:20] Live data

> Balance — 9.9990 USD. Available, held. And the last run: Open-Meteo, Berlin, COMPLETED, a tenth of a cent.

**Visual:** console populated. Hover the green COMPLETED pill, the 0.0010 cost.

> Same numbers the CLI prints. Same `/v1/balance`, same `/v1/runs`. No new backend — the API is the product.

## [0:50] Lesson 1 — partial failure

> The first build didn't look like this. It showed `BALANCE —` and `No runs`.

**Visual:** `git log`, show the allSettled commit.

> `Promise.all`. When runs 500'd, it threw away the balance too. One `allSettled` later, balance renders even when runs is broken. In a system with many dependencies, graceful degradation isn't optional.

## [1:30] Lesson 2 — we got clobbered

> The 500 wasn't our code. Our dev Postgres got overwritten.

**Visual:** `docker exec ... \dt` showing `jobs`/`tools` instead of `runs`.

> A sibling worktree ran its migrations against the same database. Our `runs` table became their `jobs`. Our ledger survived — that's what append-only means. Fix: one Postgres per worktree.

**Visual:** spin `aegntic-pg-p2` on :5435, migrate, table list shows `runs` again.

## [2:10] Outro

> Console live. Real data, real ledger, real UI. Next: deploy, a credentialed provider, and the rest of the dashboard. Subscribe.

---

## Shot list
- [ ] browser: /app gate → connect → populated console (balance 9.9990, runs table)
- [ ] screen: `git show` the Promise.allSettled diff
- [ ] terminal: `\dt` on clobbered :5434 (jobs/tools) vs isolated :5435 (runs)
- [ ] terminal: docker run aegntic-pg-p2 + migrate
- [ ] voiceover: ~2-3 min
