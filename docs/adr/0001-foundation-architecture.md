# ADR 0001 - Foundation architecture and tooling

- Status: **Proposed - awaiting owner approval** (foundation phase)
- Date: 2026-11-20

## Context

`CLAUDE.md` fixes the stack: Flutter, Next.js/React/TypeScript, NestJS, PostgreSQL, Prisma,
Firebase, Swagger/OpenAPI and Git. It does not specify the monorepo tool, test runner, linter or
Prisma major version. Those choices are listed here so they can be reviewed.

## Decisions that follow `CLAUDE.md`

- Monorepo laid out exactly as the owner-approved tree: `apps/{mobile,web}`, `backend/api`, `database/`,
  `academic-content/`, `ai-services/`, `packages/`, `docs/`, `infrastructure/`, `scripts/`.
- Applications communicate only through the REST API; the database is reachable only from the API.
- Configuration through environment variables; only `*.example` templates are committed.
- Swagger/OpenAPI is exposed at `/api/docs` outside production.

## Decisions made by the foundation (need approval)

| Area              | Choice                                                                                  | Reason                                                                |
| ----------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Workspace manager | pnpm workspaces                                                                         | Strict dependency isolation, fast installs, no extra tool             |
| Prisma            | v7 with `@prisma/adapter-pg`                                                            | Current major version; connection URL lives in `prisma.config.ts`     |
| Prisma client     | generated to `backend/api/src/generated`, **not committed**                             | Reproducible from the schema; avoids noisy diffs                      |
| API module system | ESM (`nodenext`)                                                                        | Matches Prisma 7's generated client and current Node                  |
| Test runner       | Vitest (all TypeScript packages)                                                        | One runner everywhere; fast; works with ESM                           |
| Linting/format    | oxlint + Prettier                                                                       | Minimal dependency footprint                                          |
| Schema location   | `database/prisma/` (schema, migrations, seed), config in `backend/api/prisma.config.ts` | Matches the approved tree; the API owns database access               |
| Shared package    | `@ehp/shared-types`, compiled to `dist`                                                 | Only types/constants shared by web and api (e.g. supported languages) |
| Local services    | Docker Compose, `postgres:16`                                                           | Reproducible database; apps optionally containerised via a profile    |

## Consequences

- `pnpm install` runs `prisma generate`, which downloads Prisma engine metadata, so the first
  install needs internet access.
- The Flutter `android/` folder is generated on a machine with the Flutter SDK; until then the Dart
  sources are present but unverified by `flutter analyze` / `flutter test`.
- Replacing any row above later is a contained change because each concern sits behind its own
  config file.
