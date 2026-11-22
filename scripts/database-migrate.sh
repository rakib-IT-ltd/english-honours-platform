#!/usr/bin/env bash
# Usage: scripts/database-migrate.sh [deploy]
#   (no argument)  create/apply a development migration  (prisma migrate dev)
#   deploy         apply committed migrations only        (prisma migrate deploy, CI/production)
set -euo pipefail
cd "$(dirname "$0")/../backend/api"

case "${1:-dev}" in
  dev)    exec pnpm db:migrate ;;
  deploy) exec pnpm db:migrate:deploy ;;
  *) echo "Usage: $0 [deploy]" >&2; exit 2 ;;
esac
