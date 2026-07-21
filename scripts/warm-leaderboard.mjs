// Leaderboard-warming script.
//
// Runs a small fixed set of cheap, real data tools through the production
// gateway so the public reliability leaderboard (https://aedex.ing/leaderboard,
// backed by https://aegntic-gateway.fly.dev) stays fresh and honest 24/7.
//
// Plain Node ESM, ZERO runtime deps (global fetch). Runs without `pnpm install`
// from the GitHub Actions workflow.
//
// Exit code policy:
//   1  -> env missing OR gateway entirely unreachable (so humans notice)
//   0  -> everything else, even if individual tools failed (so the cron does
//         not flap when one upstream provider has an outage)
//
// API contract confirmed from the gateway source (services/gateway/src/routes/runs.ts
// + packages/sdk/src/index.ts):
//   - Auth:        Authorization: Bearer <key>
//   - Create run:  POST /v1/runs  body { provider, endpoint, input }
//                  input shape: { body?, queryParams?, pathParams? }
//                  queryParams/pathParams values are STRINGS.
//                  -> 201 { data: Run, requestId }
//   - Poll:        GET /v1/runs/:id  -> { data: { status, result?, cost?, error? } }
//                  status ∈ READY|RUNNING|COMPLETED|FAILED|BLOCKED|STOPPED|TIME_OUT
//   - Terminal:    COMPLETED (result + cost populated) | FAILED (error populated)
//                  Failed runs cost nothing.

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 30_000;
const HTTP_TIMEOUT_MS = 15_000;

// Small fixed set of cheap real tools. Input schemas confirmed from the
// provider adapters under services/gateway/src/providers/*.ts.
//
//   provider/endpoint          cost model        worst-case cost @ cap
//   openmeteo/weather/current  per_call $0.001    $0.001
//   hackernews/stories/top     per_result $0.002  $0.002 (limit 1)
//   coingecko/markets          per_result $0.003  $0.003 (limit 1)
//   frankfurter/rates/latest   per_call $0.002    $0.002
//                                                            total <= $0.008
const TOOLS = [
  {
    label: "openmeteo/weather/current",
    provider: "openmeteo",
    endpoint: "weather/current",
    input: { queryParams: { lat: "40.7128", lon: "-74.006" } }, // NYC
  },
  {
    label: "hackernews/stories/top",
    provider: "hackernews",
    endpoint: "stories/top",
    input: { queryParams: { limit: "1" } },
  },
  {
    label: "coingecko/markets",
    provider: "coingecko",
    endpoint: "markets",
    input: { queryParams: { ids: "bitcoin", limit: "1" } },
  },
  {
    label: "frankfurter/rates/latest",
    provider: "frankfurter",
    endpoint: "rates/latest",
    input: { queryParams: { from: "USD", to: "EUR,GBP,JPY" } },
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    let body = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { _raw: text };
      }
    }
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function createRun(baseUrl, apiKey, tool) {
  const url = `${baseUrl}/v1/runs`;
  const { ok, status, body } = await fetchJson(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: tool.provider,
      endpoint: tool.endpoint,
      input: tool.input,
    }),
  });

  if (!ok) {
    const msg = body?.error || body?._raw || `HTTP ${status}`;
    throw new Error(`create run failed (${status}): ${msg}`);
  }
  const run = body?.data;
  if (!run?.id) {
    throw new Error(`create run returned no run id: ${JSON.stringify(body)}`);
  }
  return run.id;
}

function isTerminal(status) {
  return (
    status === "COMPLETED" ||
    status === "FAILED" ||
    status === "STOPPED" ||
    status === "TIME_OUT"
  );
}

async function pollRun(baseUrl, apiKey, runId) {
  const url = `${baseUrl}/v1/runs/${encodeURIComponent(runId)}`;
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  // First fetch immediately (run may already be done), then on interval.
  let first = true;
  let lastStatus = "?";
  while (true) {
    if (!first) {
      if (Date.now() >= deadline) {
        throw new Error(
          `poll timed out after ${POLL_TIMEOUT_MS}ms (last status: ${lastStatus})`,
        );
      }
      await sleep(POLL_INTERVAL_MS);
    }
    first = false;

    const { ok, status, body } = await fetchJson(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!ok) {
      const msg = body?.error || body?._raw || `HTTP ${status}`;
      throw new Error(`poll run failed (${status}): ${msg}`);
    }

    const run = body?.data;
    if (!run) {
      throw new Error(`poll run returned no data: ${JSON.stringify(body)}`);
    }

    lastStatus = run.status ?? "?";
    if (isTerminal(run.status)) {
      return run;
    }
    // Non-terminal (READY/RUNNING/BLOCKED) -> keep polling.
  }
}

async function warmOneTool(baseUrl, apiKey, tool) {
  const t0 = Date.now();
  const runId = await createRun(baseUrl, apiKey, tool);
  const run = await pollRun(baseUrl, apiKey, runId);
  const latencyMs = Date.now() - t0;

  const cost = run.cost?.value ?? 0;
  const items = run.cost?.items ?? 0;

  if (run.status === "COMPLETED") {
    return {
      ok: true,
      label: tool.label,
      status: run.status,
      latencyMs,
      cost,
      items,
    };
  }
  return {
    ok: false,
    label: tool.label,
    status: run.status,
    latencyMs,
    cost,
    items,
    error: run.error || `terminal status ${run.status}`,
  };
}

function fmtUsd(v) {
  return `$${Number(v).toFixed(4)}`;
}

async function main() {
  const baseUrl = (process.env.AEDX_BASE_URL || "").replace(/\/+$/, "");
  const apiKey = process.env.AEDX_API_KEY || "";

  const missing = [];
  if (!baseUrl) missing.push("AEDX_BASE_URL");
  if (!apiKey) missing.push("AEDX_API_KEY");
  if (missing.length > 0) {
    console.error(
      `[warm] missing required env: ${missing.join(", ")}. ` +
        "Set AEDX_BASE_URL (gateway origin) and AEDX_API_KEY (funded workspace key).",
    );
    process.exit(1);
  }

  console.log(`[warm] gateway=${baseUrl} tools=${TOOLS.length}`);

  // Liveness probe: confirm the gateway is reachable at all before fanning out.
  let gatewayReachable = false;
  try {
    const probe = await fetchJson(`${baseUrl}/v1/discover?q=weather`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    // Any HTTP response (even an auth/permission error) means the gateway is
    // up. A network failure throws and lands in the catch.
    gatewayReachable = probe.status !== undefined;
  } catch (err) {
    console.error(
      `[warm] gateway entirely unreachable at ${baseUrl}: ${err.message}`,
    );
  }
  if (!gatewayReachable) {
    console.error("[warm] aborting: gateway unreachable.");
    process.exit(1);
  }

  const results = [];
  for (const tool of TOOLS) {
    try {
      const r = await warmOneTool(baseUrl, apiKey, tool);
      results.push(r);
      if (r.ok) {
        console.log(
          `[warm] OK   ${r.label} status=${r.status} ` +
            `latency=${r.latencyMs}ms items=${r.items} cost=${fmtUsd(r.cost)}`,
        );
      } else {
        console.log(
          `[warm] FAIL ${r.label} status=${r.status} ` +
            `latency=${r.latencyMs}ms cost=${fmtUsd(r.cost)} err=${r.error}`,
        );
      }
    } catch (err) {
      // One provider outage (or transient run error) must not abort the rest.
      const errResult = {
        ok: false,
        label: tool.label,
        status: "ERROR",
        latencyMs: 0,
        cost: 0,
        items: 0,
        error: err instanceof Error ? err.message : String(err),
      };
      results.push(errResult);
      console.log(
        `[warm] FAIL ${tool.label} status=ERROR err=${errResult.error}`,
      );
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  console.log(
    `[warm] done: ${okCount}/${results.length} tools ok, ` +
      `total cost=${fmtUsd(totalCost)}`,
  );

  // Exit 0 regardless of per-tool failures so the cron does not flap.
  process.exit(0);
}

main().catch((err) => {
  console.error(
    `[warm] fatal: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
