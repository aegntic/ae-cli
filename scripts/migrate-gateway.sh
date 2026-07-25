#!/usr/bin/env bash
# Apply gateway drizzle migrations (services/gateway/migrations) to the prod DB
# (aedex-db) through a temporary fly proxy, then tear the proxy down.
#
# The gateway does NOT run migrations on boot, so new migrations must be applied
# explicitly. Reads the authoritative DATABASE_URL from the running gateway's env
# (a Fly secret — not readable via `flyctl secrets list`), rewrites its host to
# localhost, and runs `drizzle-kit migrate` through the proxy.
#
# Run from anywhere; it cd's to the repo root.
set -euo pipefail

APP="${AEGNTIC_GATEWAY_APP:-aegntic-gateway}"
DB_APP="${AEDX_DB_APP:-aedex-db}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GW="$ROOT/services/gateway"

echo "→ reading DATABASE_URL from running gateway ($APP)"
DB_URL="$(flyctl ssh console -a "$APP" -C "printenv DATABASE_URL" 2>/dev/null | tr -d '\r' | tail -1)"
if [ -z "${DB_URL:-}" ]; then
  echo "could not read DATABASE_URL from $APP (is the gateway running?)" >&2
  exit 1
fi
# Rewrite host → localhost for the proxy, and default the db name to `postgres`.
LOCAL_URL="$(printf '%s' "$DB_URL" | sed -E 's#@[^/]*:5432#@localhost:5432#')"
case "$LOCAL_URL" in
  */*) : ;;
  *)  LOCAL_URL="$LOCAL_URL/postgres" ;;
esac

echo "→ opening fly proxy to $DB_APP :5432 (torn down on exit)"
fly proxy 5432:5432 -a "$DB_APP" &
PROXY=$!
trap 'kill "$PROXY" 2>/dev/null || true' EXIT
sleep 6

echo "→ drizzle-kit migrate"
DATABASE_URL="$LOCAL_URL" "$GW/node_modules/.bin/drizzle-kit" migrate

echo "✓ migrations applied"
