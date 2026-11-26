#!/usr/bin/env bash
# Run the whole platform inside a GitHub Codespace so the home page can show universities.
# Steps: apply migrations, seed names-only development data, point the website at the API and the
# Firebase Auth Emulator, make their ports reachable by the browser, then start the emulator (9099),
# API (3001) and web (3000).
# Usage (from the repository root, in the Codespace terminal):  bash scripts/codespaces-dev.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${CODESPACE_NAME:-}" || -z "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  echo "This script is for GitHub Codespaces. Locally, follow the Quick start in README.md." >&2
  exit 1
fi

WEB_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
API_URL="https://${CODESPACE_NAME}-3001.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
AUTH_URL="https://${CODESPACE_NAME}-9099.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

# Stops anything left over from an earlier run. Pressing Ctrl+C used to stop only the outer
# "pnpm" wrappers, so the real API / web / emulator programs (and their "watch" restarters) kept
# running in the background, kept their ports busy, and the next start failed with
# "address already in use" or the public address answered "404 page can't be found".
# This uses only "ss" and "pkill", which every Codespace has (lsof may be missing).
PORTS="3000 3001 3002 4400 4401 4500 4501 9099"
free_ports() {
  # 1. Stop the restarters first, otherwise they start a new copy as soon as one is killed.
  pkill -f "nest start" 2>/dev/null || true
  pkill -f "start:dev" 2>/dev/null || true
  pkill -f "dev:api" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
  pkill -f "firebase-tools" 2>/dev/null || true
  sleep 1
  # 2. Then stop whatever still holds one of our ports.
  for port in ${PORTS}; do
    ss -ltnp "sport = :${port}" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u |
      xargs -r kill -9 2>/dev/null || true
  done
  sleep 1
}
free_ports

# After a "git pull" new packages may be needed (installing also regenerates the database client).
pnpm install
pnpm db:generate

# The API and web import the built shared package (dist/ is git-ignored, so build it first).
pnpm --filter @ehp/shared-types build

pnpm db:migrate:deploy
pnpm db:seed
pnpm db:load-content
# Development only: clearly labelled sample study material so the study screens can be tried.
pnpm db:load-sample

# Only public values go into the browser bundle - no secrets. The Auth Emulator accepts any
# placeholder API key, so no Firebase account is needed here.
cat > apps/web/.env.local <<ENV
NEXT_PUBLIC_API_BASE_URL=${API_URL}/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-ehp
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL=${AUTH_URL}
ENV

# The browser calls the API and the Auth Emulator directly, so both ports must be public
# (development only; the data is temporary test data).
gh codespace ports visibility 3001:public 9099:public -c "${CODESPACE_NAME}" || \
  echo "Could not change port visibility automatically: set ports 3001 and 9099 to Public in the Ports tab." >&2

echo "Web: ${WEB_URL}"
echo "API docs: ${API_URL}/api/docs"

npx --yes firebase-tools@14 emulators:start --only auth --project demo-ehp \
  --config infrastructure/firebase/firebase.json &
EMULATOR_PID=$!
for _ in $(seq 1 60); do
  curl -sf http://127.0.0.1:9099/ >/dev/null && break
  sleep 1
done

FIREBASE_PROJECT_ID=demo-ehp FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
  CORS_ORIGINS="${WEB_URL}" pnpm dev:api &
API_PID=$!
trap 'free_ports' EXIT
trap 'exit 130' INT TERM
pnpm dev:web
