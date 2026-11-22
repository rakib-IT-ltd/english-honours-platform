#!/usr/bin/env bash
# Creates a compressed PostgreSQL dump in database/backups/ (git-ignored).
# DATABASE_URL is read from the environment, or from backend/api/.env if unset.
# Backups may contain real user data: keep them private and never commit them.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

command -v pg_dump >/dev/null 2>&1 || { echo "pg_dump is required (install the PostgreSQL client tools)." >&2; exit 1; }

if [ -z "${DATABASE_URL:-}" ] && [ -f "$root/backend/api/.env" ]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' "$root/backend/api/.env" | head -n1 | cut -d= -f2-)"
fi
[ -n "${DATABASE_URL:-}" ] || { echo "DATABASE_URL is not set (environment or backend/api/.env)." >&2; exit 1; }

# pg_dump rejects Prisma-specific query parameters such as ?schema=public.
conn="${DATABASE_URL%%\?*}"

mkdir -p "$root/database/backups"
out="$root/database/backups/ehp-$(date -u +%Y%m%dT%H%M%SZ).dump"
umask 077
pg_dump --format=custom --no-owner --file="$out" "$conn"
echo "Backup written to ${out#"$root"/}"
