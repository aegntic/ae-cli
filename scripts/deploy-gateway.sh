#!/usr/bin/env bash
# Deploy the aedex gateway to Fly.
#
# Codifies the build + node_modules deref that is easy to get wrong:
# `node_modules-real` MUST be produced by `pnpm deploy` (it preserves the `.pnpm`
# symlink structure so a nested dependency like resend's `postal-mime` resolves
# at runtime). `cp -rL` / tar deref BREAK that — the container then crashes with
# `Cannot find package 'postal-mime'`. esbuild-bundling the gateway also fails:
# it resolves deps but `serve()` does not keep the process alive on Fly.
#
# Run from anywhere; it cd's to the repo root.
set -euo pipefail

APP="${AEGNTIC_GATEWAY_APP:-aegntic-gateway}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GW="$ROOT/services/gateway"
STAGE="/tmp/aedex-gw-deploy"

echo "→ building gateway (tsc)"
(cd "$ROOT" && pnpm --filter @aegntic/gateway build)

echo "→ deref node_modules via pnpm deploy (symlink-correct)"
rm -rf "$STAGE" "$GW/node_modules-real"
(cd "$ROOT" && pnpm deploy --filter=@aegntic/gateway --prod "$STAGE")
cp -r "$STAGE/node_modules" "$GW/node_modules-real"

echo "→ verify nested-dep resolution against node_modules-real (not local node_modules)"
(
  cd "$GW/node_modules-real"
  node --input-type=module -e \
    "import('resend').then(()=>console.log('  resend resolves ✓')).catch(e=>{console.error('  FAIL:',e.message);process.exit(1)})"
)

echo "→ fly deploy (run from services/gateway — Dockerfile + fly.toml live there)"
(cd "$GW" && flyctl deploy --app "$APP" --strategy rolling)

echo
echo "✓ deployed: https://$APP.fly.dev/health"
echo "  reminders:"
echo "   - secrets:  flyctl secrets list --app $APP   (need RESEND_API_KEY, MAIL_FROM, FREE_SIGNUP_CREDIT_USD)"
echo "   - migrate:  ./scripts/migrate-gateway.sh"
