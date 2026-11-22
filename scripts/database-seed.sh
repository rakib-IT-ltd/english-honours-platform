#!/usr/bin/env bash
# Seeding is intentionally not implemented in the foundation phase.
# database/prisma/seed/*.ts are empty placeholders: syllabus data must come from the verified
# official source document, never from memory, and sample data must be clearly labelled.
set -euo pipefail
echo "No seed data is implemented yet (see database/prisma/seed/ and database/documentation/DATABASE_RULES.md)." >&2
exit 1
