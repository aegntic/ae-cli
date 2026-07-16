# ADR-0005 — Provider adapter pattern: interface + mock-first

**Date:** 2026-07-17
**Status:** Accepted

## Context
Gateway must abstract over many providers (Apify, PDL, Browserbase, etc.) without coupling to any one. First demo needs to work without real provider credentials.

## Decision
Define a `ProviderAdapter` interface. Ship a `MockProvider` for P1 demo. Add real adapters (Apify first) in P2.

```typescript
interface ProviderAdapter {
  name: string
  endpoints: Endpoint[]
  execute(endpoint: string, input: RunInput): Promise<RunResult>
  estimateCost(endpoint: string, input: RunInput): Promise<number>
}

interface Endpoint {
  provider: string
  path: string
  description: string
  inputSchema: InputSchema
  costModel: CostModel
  verified: boolean
}
```

## Consequences
- (+) Mock provider unblocks full vertical slice without third-party dependencies
- (+) Real adapters implement the same interface — no gateway changes needed
- (+) Catalog search works against the endpoint registry regardless of provider
- (−) Mock data isn't convincing — replace with real provider ASAP in P2
