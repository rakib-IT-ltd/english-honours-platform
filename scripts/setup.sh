#!/usr/bin/env bash
# One-time local setup: checks prerequisites, creates git-ignored env files from the templates,
# installs dependencies. Safe to re-run; never overwrites an existing env file.
set -euo pipefail
cd "$(dirname "$0")/.."

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required tool: $1" >&2; exit 1; }; }
need node
need pnpm

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$node_major" -lt 22 ]; then
  echo "Node.js 22 or newer is required (found $(node -v))." >&2
  exit 1
fi

copy_if_missing() {
  if [ -e "$2" ]; then echo "keep   $2 (already exists)"; else cp "$1" "$2"; echo "create $2"; fi
}
copy_if_missing .env.example .env
copy_if_missing backend/api/.env.example backend/api/.env
copy_if_missing apps/web/.env.example apps/web/.env.local
copy_if_missing apps/mobile/env.example.json apps/mobile/env.json

pnpm install

cat <<'MSG'

Next steps:
  1. Edit .env: set POSTGRES_PASSWORD.
  2. Edit backend/api/.env: replace CHANGE_ME in DATABASE_URL with the same password.
  3. docker compose up -d postgres
  4. pnpm dev:api   (and, in another terminal)   pnpm dev:web
  Mobile: see apps/mobile/README.md (the android/ folder must be generated with Flutter first).
MSG
