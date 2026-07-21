import { sql } from "drizzle-orm"
import { db } from "./client.js"
import { listEndpoints } from "../providers/registry.js"
import type { Endpoint } from "@aegntic/sdk"

/**
 * Seed the persisted tools catalog from the in-memory adapter registry.
 *
 * Replaces the in-memory registry as the source of truth for discover and
 * inspect. EXECUTION still goes through the registry (the adapter is the
 * execution contract); the catalog row is metadata only. kind=native marks
 * aegntic-runnable adapters; kind=external|mcp is reserved for future
 * cldcde-backed skills.
 *
 * Idempotent: ON CONFLICT DO UPDATE so descriptions, schemas, cost models,
 * and tags refresh on every boot without manual migration. Does NOT touch
 * kind — once a row is promoted to external/mcp by a later phase, a re-seed
 * of the native adapter must not clobber it. Returns the row count.
 */

/**
 * Build a SQL text[] literal from a JS string array. Each element is single-
 * quoted with internal single-quotes doubled (the Postgres string-literal
 * escape). Empty array -> '{}'::text[]. This is the safest path through
 * drizzle's sql tag — drizzle does not forward postgres-js array envelopes
 * cleanly, so we render the literal ourselves with strict escaping.
 *
 * Inputs are app-controlled (provider, path segments) — never user-supplied
 * — but we still escape defensively.
 */
function textArrayLiteral(values: string[]): string {
  if (values.length === 0) return "'{}'::text[]"
  const quoted = values.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(",")
  return `ARRAY[${quoted}]::text[]`
}

export async function seedCatalog(): Promise<number> {
  const endpoints = listEndpoints()

  for (const ep of endpoints) {
    const id = `${ep.provider}/${ep.path}`
    const tags = defaultTagsFor(ep)
    const tagsLiteral = textArrayLiteral(tags)

    await db
      .execute(sql`
        INSERT INTO tools (id, provider, path, description, input_schema, cost_model, verified, tags, kind)
        VALUES (
          ${id},
          ${ep.provider},
          ${ep.path},
          ${ep.description},
          ${JSON.stringify(ep.inputSchema)}::jsonb,
          ${JSON.stringify(ep.costModel)}::jsonb,
          ${ep.verified},
          ${sql.raw(tagsLiteral)},
          'native'
        )
        ON CONFLICT (id) DO UPDATE SET
          provider      = EXCLUDED.provider,
          path          = EXCLUDED.path,
          description   = EXCLUDED.description,
          input_schema  = EXCLUDED.input_schema,
          cost_model    = EXCLUDED.cost_model,
          verified      = EXCLUDED.verified,
          tags          = EXCLUDED.tags,
          updated_at    = now()
        WHERE tools.kind = 'native'
      `)
  }

  return endpoints.length
}

/**
 * Sensible default tags: the provider name plus the resource family (the
 * segment before the first '/' in the path). E.g. twitter/posts -> [mock,
 * twitter]. Helps "twitter posts" full-text queries rank highly.
 */
function defaultTagsFor(ep: Endpoint): string[] {
  const family = ep.path.split("/")[0]
  const tags = new Set<string>([ep.provider])
  if (family && family !== ep.provider) tags.add(family)
  // Pull the leading verb/noun from the path's second segment when present.
  const segment = ep.path.split("/")[1]
  if (segment) tags.add(segment)
  return Array.from(tags)
}

// CLI runner: `pnpm --filter @aegntic/gateway db:seed-catalog`
if (import.meta.main) {
  const n = await seedCatalog()
  // eslint-disable-next-line no-console
  console.log(`[seed-catalog] upserted ${n} native tool rows into tools`)
  process.exit(0)
}
