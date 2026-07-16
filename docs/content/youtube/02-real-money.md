# YouTube Script — Checkpoint 2: Real Money

**Length:** ~3-4 min. **Pace:** deliberate, screen-recorded, voiceover. **Goal:** prove the CLI executes real external data and bills a durable ledger — no mock, no in-memory fakery.

---

## [0:00] Cold open — the claim

> At the end of Checkpoint 1, this CLI worked — but it ran on mock data, and your balance was a number in a JavaScript Map. Today we fix both. Real external API. Real durable billing.

**Visual:** terminal, cursor blinking. Title card: "Checkpoint 2: Real Money."

## [0:15] Part 1 — the ledger is append-only

> First, balance is no longer state. It's history. There's a `balance_ledger` table. Topups and refunds add. Charges subtract. Balance is the sum.

**Visual:** open the DB, show the table.

```
docker exec aegntic-pg psql -U aegntic -d aegntic -c "\d balance_ledger"
```

> Kill the server.

**Visual:** `kill` the gateway PID.

> Restart it. Same balance — because it was never in memory.

**Visual:** `node dist/index.js`, then `aegntic balance` → identical number.

## [1:00] Part 2 — the failure path is free

> A run that fails costs you nothing. We couldn't trigger that from the CLI, so we wrote a test that injects a provider which throws.

**Visual:** show `billing.test.ts`, highlight the failing-provider block + `expect(charges).toHaveLength(0)`.

> Six tests, all green.

**Visual:** `pnpm test` → 6 passed.

## [1:30] Part 3 — the first real provider

> Open-Meteo. Free, no key. Behind the same interface as the mock — one `addProvider` call, zero gateway changes.

**Visual:** show `providers/openmeteo.ts`, highlight `fetch("https://api.open-meteo.com/...")`.

> Now run it for real.

**Visual:**

```
aegntic discover -q weather          # → openmeteo / weather/current
aegntic inspect -p openmeteo -e weather/current
aegntic run -p openmeteo -e "weather/current" --query '{"lat":"52.52","lon":"13.405"}' -w
```

> That's real Berlin weather. 25.3 degrees. Fifteen-minute interval — that's Open-Meteo's signature, not ours. And it cost a tenth of a cent.

## [2:45] Part 4 — the charge is on the ledger

**Visual:**

```
docker exec aegntic-pg psql -U aegntic -d aegntic -c \
  "SELECT type, amount, run_id, reason FROM balance_ledger ORDER BY id;"
```

> A `charge`, `0.0010`, against the run id we just created. Durable. Auditable.

## [3:15] The honest moment

> Our first test said billing worked. A paranoid second pass said the balance didn't move. Both were right — we charge a tenth of a cent and displayed cents. Sub-cent charges were invisible. We don't ship invisible money.

**Visual:** `git show 6ea5549` — the `toFixed(4)` fix.

## [3:40] Outro — what's next

> Checkpoint 2 done. Real data, real ledger, real money. Next: deploy this so it's live, wire a credentialed provider, and build the dashboard. Subscribe.

---

## Shot list / assets to capture
- [ ] terminal: `\d balance_ledger` + the ledger rows
- [ ] terminal: kill + restart gateway, `balance` identical
- [ ] screen: `billing.test.ts` failing-provider test + `pnpm test` 6 passed
- [ ] terminal: `discover/inspect/run openmeteo` returning real Berlin weather
- [ ] terminal: ledger SQL showing `charge 0.0010 run_id=8FG6oIIjxP1B`
- [ ] screen: `git show 6ea5549` (toFixed(4))
- [ ] voiceover: record clean, ~3-4 min
