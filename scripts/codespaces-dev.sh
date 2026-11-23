#!/usr/bin/env bash
# Run the whole platform inside a GitHub Codespace so the home page can show universities.
# Steps: apply migrations, seed names-only development data, point the website at the API's
# forwarded URL, make the API port reachable by the browser, then start API (3001) and web (3000).
# Usage (from the repository root, in the Codespace terminal):  bash scripts/codespaces-dev.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${CODESPACE_NAME:-}" || -z "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  echo "This script is for GitHub Codespaces. Locally, follow the Quick start in README.md." >&2
  exit 1
fi

WEB_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
API_URL="https://${CODESPACE_NAME}-3001.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

pnpm db:migrate:deploy
pnpm db:seed

# Only the (public) API address goes into the browser bundle - no secrets.
echo "NEXT_PUBLIC_API_BASE_URL=${API_URL}/api/v1" > apps/web/.env.local

# The browser calls the API directly, so the API port must be public (development only).
gh codespace ports visibility 3001:public -c "${CODESPACE_NAME}" || \
  echo "Could not change port visibility automatically: set port 3001 to Public in the Ports tab." >&2

echo "Web: ${WEB_URL}"
echo "API docs: ${API_URL}/api/docs"

CORS_ORIGINS="${WEB_URL}" pnpm dev:api &
API_PID=$!
trap 'kill "${API_PID}" 2>/dev/null || true' EXIT
pnpm dev:web
