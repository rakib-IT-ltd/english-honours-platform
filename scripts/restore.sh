#!/usr/bin/env bash
# Restores a pg_dump backup made by scripts/backup.sh into an EMPTY database, in one transaction.
# Usage: RESTORE_DATABASE_URL=<target connection string> bash scripts/restore.sh <file.dump> <target-database-name>
#   The second argument must be the target database's name (restoring is a deliberate act).
#   The target must be empty (a new database): if anything already exists, pg_restore fails and, because
#   it runs in a single transaction, nothing is changed. DATABASE_URL is deliberately NOT used, so a
#   restore can never hit the live database by accident.
set -euo pipefail

command -v pg_restore >/dev/null 2>&1 || { echo "pg_restore is required (install the PostgreSQL client tools)." >&2; exit 1; }
file="${1:-}"
confirm="${2:-}"
[ -f "$file" ] || { echo "Usage: RESTORE_DATABASE_URL=... bash scripts/restore.sh <file.dump> <target-database-name>" >&2; exit 1; }
[ -n "${RESTORE_DATABASE_URL:-}" ] || { echo "RESTORE_DATABASE_URL is not set (the connection string of the EMPTY target database)." >&2; exit 1; }

# pg_restore rejects Prisma-specific query parameters such as ?schema=public.
conn="${RESTORE_DATABASE_URL%%\?*}"
name="${conn##*/}"
[ -n "$confirm" ] || { echo "Add the target database name as the second argument (it is \"$name\")." >&2; exit 1; }
[ "$confirm" = "$name" ] || { echo "\"$confirm\" does not match the target database \"$name\". Nothing was restored." >&2; exit 1; }

pg_restore --no-owner --single-transaction --exit-on-error --dbname="$conn" "$file"
echo "Restored $file into \"$name\" (single transaction)."
