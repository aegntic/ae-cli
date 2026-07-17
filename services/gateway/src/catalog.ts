import { sql } from "drizzle-orm"
import { db } from "./db/client.js"
import type { Endpoint } from "@aegntic/sdk"

/**
 * DB-backed discovery over the persisted tools catalog.
 *
 * Replaces `registry.searchProviders` / `registry.getEndpoint` as the source
 * of truth for the discover and inspect routes. v1 = Postgres full-text
 * search (plainto_tsquery against the search_tsv tsvector maintained by the
 * tools_search_tsv_trigger). v2 will add pgvector semantic ranking.
 *
 * EXECUTION is unchanged: routes still call `registry.getProvider(name)` to
 * obtain the adapter. The catalog row is metadata; the adapter is the
 * runtime contract.
 *
 * Every row is mapped back to the SDK Endpoint shape so the route response
 * contracts are unchanged.
 */

interface CatalogRow {
  id: string
  provider: string
  path: string
  description: string
  input_schema: unknown
  cost_model: unknown
  verified: boolean
  tags: string[] | null
  score: number | null
  [key: string]: unknown
}

function rowToEndpoint(row: CatalogRow): Endpoint {
  return {
    provider: row.provider,
    path: row.path,
    description: row.description,
    inputSchema: (row.input_schema ?? {}) as Endpoint["inputSchema"],
    costModel: (row.cost_model ?? {
      type: "per_call",
      unitPrice: 0,
      currency: "USD",
    }) as Endpoint["costModel"],
    verified: row.verified,
    relevanceScore: row.score !== null ? Number(row.score) : undefined,
  }
}

/**
 * Full-text search with an ILIKE fallback for partial matches that the
 * stemmer misses. Returns Endpoint-shaped rows ranked by ts_rank. The
 * fallback only runs when the full-text pass returns nothing, so a hit on
 * the tsvector always wins.
 */
export async function searchCatalog(
  query: string,
  limit = 10,
  minScore = 0,
): Promise<Endpoint[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50))

  // Pass 1: full-text (stemmed) via plainto_tsquery against the GIN index.
  const ftsRows = await db.execute<CatalogRow>(sql`
    SELECT
      id, provider, path, description, input_schema, cost_model, verified, tags,
      ts_rank(search_tsv, plainto_tsquery('english', ${query})) AS score
    FROM tools
    WHERE search_tsv @@ plainto_tsquery('english', ${query})
    ORDER BY score DESC
    LIMIT ${safeLimit}
  `)

  if (ftsRows.length > 0) {
    return ftsRows
      .map((r) => rowToEndpoint(r as CatalogRow))
      .filter((e) => (e.relevanceScore ?? 0) >= minScore)
  }

  // Pass 2: ILIKE fallback for partial / non-stem matches. Relevance is
  // constant (1.0) since ILIKE has no native ranking; ordering is by
  // description. Empty if no substring hit either.
  const likePattern = `%${query.replace(/[%_]/g, (m) => "\\" + m)}%`
  const likeRows = await db.execute<CatalogRow>(sql`
    SELECT
      id, provider, path, description, input_schema, cost_model, verified, tags,
      1.0::float8 AS score
    FROM tools
    WHERE description ILIKE ${likePattern}
       OR provider ILIKE ${likePattern}
       OR path ILIKE ${likePattern}
    ORDER BY description
    LIMIT ${safeLimit}
  `)

  return likeRows
    .map((r) => rowToEndpoint(r as CatalogRow))
    .filter((e) => (e.relevanceScore ?? 0) >= minScore)
}

/** Single-row lookup for inspect. Maps the Endpoint shape 1:1. */
export async function getCatalogEndpoint(
  provider: string,
  path: string,
): Promise<Endpoint | undefined> {
  const rows = await db.execute<CatalogRow>(sql`
    SELECT
      id, provider, path, description, input_schema, cost_model, verified, tags,
      NULL::float8 AS score
    FROM tools
    WHERE provider = ${provider} AND path = ${path}
    LIMIT 1
  `)
  const row = rows[0]
  return row ? rowToEndpoint(row as unknown as CatalogRow) : undefined
}

/** List the catalog, optionally filtered by provider. */
export async function listCatalog(provider?: string): Promise<Endpoint[]> {
  const rows = provider
    ? await db.execute<CatalogRow>(sql`
        SELECT
          id, provider, path, description, input_schema, cost_model, verified, tags,
          NULL::float8 AS score
        FROM tools
        WHERE provider = ${provider}
        ORDER BY provider, path
      `)
    : await db.execute<CatalogRow>(sql`
        SELECT
          id, provider, path, description, input_schema, cost_model, verified, tags,
          NULL::float8 AS score
        FROM tools
        ORDER BY provider, path
      `)
  return rows.map((r) => rowToEndpoint(r as CatalogRow))
}
