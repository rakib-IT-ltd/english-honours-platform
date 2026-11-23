#!/usr/bin/env bash
# Development seed (names only): universities, Department of English, programs and their levels.
# No syllabus, course or session data is seeded (those need official source documents).
set -euo pipefail
cd "$(dirname "$0")/.."
exec pnpm db:seed
