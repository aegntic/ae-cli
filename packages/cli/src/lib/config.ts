import { readFile, writeFile, mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "pathe"

/**
 * Unified CLI config.
 *
 * Single source of truth for every command. Supports a multi-key store
 * (label -> secret) with an active label, plus a legacy single `apiKey`
 * field for backward compatibility with configs written by older CLI
 * versions and with the `keys` command flow.
 *
 * Shape on disk (~/.aegntic/config.json):
 *   {
 *     "baseUrl": "https://aegntic-gateway.fly.dev",
 *     "activeKey": "main",            // optional; falls back to "main"
 *     "keys": { "main": "aedex_live_..." },
 *     "apiKey": "aedex_live_..."      // legacy alias; tolerated if present
 *   }
 *
 * Env overrides (win over the file): AEGNTIC_BASE_URL, AEGNTIC_API_KEY.
 */
export interface Config {
  baseUrl: string
  activeKey: string
  keys: Record<string, string>
  /** Legacy single-key alias. Resolved as a fallback to keys[activeKey]. */
  apiKey?: string
}

/** Production gateway — the only correct default for first-run users. */
export const DEFAULT_BASE_URL = "https://aegntic-gateway.fly.dev"
export const DEFAULT_ACTIVE_LABEL = "main"

function configPath(): string {
  return join(homedir(), ".aegntic", "config.json")
}

function resolveActiveKey(config: Config): string {
  return (
    process.env.AEGNTIC_API_KEY ||
    config.keys[config.activeKey] ||
    config.keys[DEFAULT_ACTIVE_LABEL] ||
    config.apiKey ||
    ""
  )
}

export async function getConfig(): Promise<Config> {
  let fileConfig: Partial<Config> = {}

  try {
    const raw = await readFile(configPath(), "utf-8")
    fileConfig = JSON.parse(raw) as Partial<Config>
  } catch {
    // No config yet — fall through to defaults.
  }

  const baseUrl =
    process.env.AEGNTIC_BASE_URL || fileConfig.baseUrl || DEFAULT_BASE_URL
  const activeKey = fileConfig.activeKey || DEFAULT_ACTIVE_LABEL
  const keys = fileConfig.keys || {}
  const apiKey = fileConfig.apiKey

  return { baseUrl, activeKey, keys, apiKey }
}

/**
 * Resolved, ready-to-use credentials. `apiKey` is the single secret every
 * command needs, after env / multi-key / legacy resolution.
 */
export async function getResolvedConfig(): Promise<Config & { apiKey: string }> {
  const config = await getConfig()
  return { ...config, apiKey: resolveActiveKey(config) }
}

/**
 * Returns the active API key, or empty string if none is configured.
 * Env var wins, then keys[activeKey], then keys["main"], then legacy apiKey.
 */
export async function getApiKey(): Promise<string> {
  const config = await getConfig()
  return resolveActiveKey(config)
}

/**
 * Merge a partial update into the on-disk config. Only the supplied keys
 * are overwritten; existing keys (e.g. the multi-key store) are preserved.
 */
export async function saveConfig(update: Partial<Config>): Promise<void> {
  const path = configPath()
  let existing: Record<string, unknown> = {}

  try {
    const raw = await readFile(path, "utf-8")
    existing = JSON.parse(raw) as Record<string, unknown>
  } catch {
    await mkdir(join(homedir(), ".aegntic"), { recursive: true })
  }

  // Deep-merge the keys map so adding/activating one key never wipes the others.
  const merged: Record<string, unknown> = { ...existing }
  if (update.baseUrl !== undefined) merged.baseUrl = update.baseUrl
  if (update.activeKey !== undefined) merged.activeKey = update.activeKey
  if (update.apiKey !== undefined) merged.apiKey = update.apiKey
  if (update.keys !== undefined) {
    merged.keys = {
      ...(existing.keys as Record<string, string> | undefined),
      ...update.keys,
    }
  }

  await writeFile(path, JSON.stringify(merged, null, 2), "utf-8")
}
