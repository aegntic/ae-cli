# ADR-0003 — ae-cli is an independent repo nested inside the cognitive-os vault

**Date:** 2026-07-17
**Status:** Accepted

## Context
Working directory `/home/ae/AE/03_Vault/ae-cli` lives inside `/home/ae/AE`, which is a clone of `aegntic/cognitive-os` (a spec repo, currently on a dirty `feat/insidher-universal-tabs-sms-agent` branch with unrelated insidher work). Committing ae-cli work through the cognitive-os remote would entangle two projects and pollute the spec repo.

## Decision
`git init` a **fresh, independent repository** at `/home/ae/AE/03_Vault/ae-cli` with its own remote `github.com/aegntic/ae-cli`. The parent cognitive-os git sees it as an untracked nested path — left alone, never committed upward.

## Consequences
- (+) Clean separation; no entanglement with insidher or cog-OS spec.
- (+) Own remote, own CI, own visibility (ADR-0002).
- (−) Nested git repos can confuse naive tooling — documented; use explicit `-C` / worktrees.
