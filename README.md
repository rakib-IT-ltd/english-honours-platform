# English Honours Learning Platform

A bilingual (English / Bangla) academic learning platform for English Honours students in
Bangladesh, starting with National University (NU) and designed to extend to other universities,
sessions and syllabus versions.

> **Status: project foundation only.** There is no dashboard, no academic module, no syllabus data
> and no AI feature yet. Academic accuracy rules are in [`CLAUDE.md`](./CLAUDE.md) - in particular,
> syllabus information is never invented and unverified content is never marked as verified.

## Repository layout

```
CLAUDE.md                 Project instructions and academic governance rules (read-only)
docker-compose.yml        Development stack (PostgreSQL; optional containerised apps)
.env.example              Root (Docker) environment template
apps/
  mobile/                 Flutter (Android) app: lib/{core,features,shared}, assets, test
  web/                    Next.js (React, TypeScript): src/{app,components,features,...}, tests
backend/
  api/                    NestJS API: src/{common,config,database,<domain modules>}, test
database/
  prisma/                 schema.prisma, migrations/, seed/ (placeholders)
  documentation/          ERD and database rules
  backups/                Local dumps (git-ignored)
academic-content/         Verified source material (syllabus, references, guidelines) - empty
ai-services/              AI assistant (prompts, retrieval, embeddings, evaluation) - not implemented
packages/
  shared-types/           TypeScript types/helpers shared by web and api (the only built package)
  api-client/ validation/ eslint-config/   Placeholders
docs/                     Project documents and architecture decision records (docs/adr)
infrastructure/           docker/ (dev image), deployment/, firebase/, monitoring/
scripts/                  setup.sh, database-migrate.sh, database-seed.sh, backup.sh
```

Most feature folders (backend modules, web routes, mobile features) are intentionally **empty
placeholders** (`.gitkeep`) and are filled one module at a time after approval.

## Prerequisites

| Tool                 | Version                                             |
| -------------------- | --------------------------------------------------- |
| Node.js              | 22 LTS (see `.nvmrc`)                               |
| pnpm                 | 10.x (`corepack enable` picks the pinned one)       |
| PostgreSQL           | 16, or Docker with Compose v2                       |
| Flutter SDK (mobile) | stable, Dart >= 3.8 - only needed for `apps/mobile` |

## Open in VS Code or GitHub Codespaces

- **Codespaces (VS Code in the browser):** on the GitHub repository page choose **Code -> Codespaces
  -> Create codespace on main**. The dev container (`.devcontainer/`) starts Node 22, pnpm and a
  PostgreSQL 16 database, installs dependencies and applies the migrations automatically.
- **Local VS Code:** clone the repository, open the folder, accept the recommended extensions, then
  either **Dev Containers: Reopen in Container** (same setup as Codespaces) or follow the Quick start
  below on your own machine.

Then run **Terminal -> Run Task -> Dev: API + Web** (tasks are in `.vscode/tasks.json`). Open the
forwarded ports: web on 3000, API on 3001 (`/api/docs` for Swagger). **Test: all** runs the test suites.
The Flutter app is not part of the container; see `apps/mobile/README.md`.

## Quick start

```bash
corepack enable
pnpm install                          # also runs `prisma generate` (needs internet access)

# 1. Environment files (placeholders only are committed - fill in your own values).
#    `scripts/setup.sh` does the copies below for you (never overwrites existing files).
cp .env.example              .env                   # set POSTGRES_PASSWORD
cp backend/api/.env.example  backend/api/.env       # use the same password in DATABASE_URL
cp apps/web/.env.example     apps/web/.env.local

# 2. Database
docker compose up -d postgres
pnpm db:migrate                       # applies the committed migrations (use `db:migrate:deploy` in CI)

# 3. Apps (separate terminals)
pnpm dev:api     # http://localhost:3001/api/v1/health   Swagger: http://localhost:3001/api/docs
pnpm dev:web     # http://localhost:3000
```

Run the whole stack in containers instead (API + web with hot reload):

```bash
docker compose --profile apps up
```

### Mobile (Flutter)

The Dart sources live in `apps/mobile`, but the `android/` platform folder has not been generated
yet. See [`apps/mobile/README.md`](./apps/mobile/README.md) for the one-time `flutter create` step,
then:

```bash
cd apps/mobile
cp env.example.json env.json          # git-ignored
flutter run --dart-define-from-file=env.json
```

## Common commands

| Command                           | Purpose                                                 |
| --------------------------------- | ------------------------------------------------------- |
| `pnpm test`                       | Unit tests for every workspace package                  |
| `pnpm --filter @ehp/api test:e2e` | API end-to-end tests (database stubbed)                 |
| `pnpm typecheck`                  | TypeScript checks for every package                     |
| `pnpm lint`                       | oxlint                                                  |
| `pnpm format:check`               | Prettier check (`pnpm format` to fix)                   |
| `pnpm build`                      | Build shared, api and web                               |
| `pnpm db:generate`                | Regenerate the Prisma client                            |
| `pnpm db:migrate`                 | Create/apply a development migration (needs a database) |
| `cd apps/mobile && flutter test`  | Flutter tests                                           |

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull request: Prettier, oxlint,
typecheck, unit and e2e tests and builds, plus a database job that applies the committed migrations
to a PostgreSQL 16 service and fails if they differ from `schema.prisma`.

## Website preview (GitHub Pages)

`.github/workflows/pages.yml` publishes a **static preview** of `apps/web` (no API or database) to
`https://<owner>.github.io/english-honours-platform/`. Enable it once under
**Settings -> Pages -> Source: GitHub Actions**. The static export is switched on only by that
workflow (`GITHUB_PAGES=true`); normal `pnpm dev:web` / `pnpm build` are unchanged.

## Configuration and secrets

- The root and each app have a committed `*.example` template and a git-ignored real file. Only placeholders are
  committed; never commit keys, passwords or service-account files (`.gitignore` blocks the common
  ones).
- Development and production configuration are separate: production values come from the hosting
  platform's secret manager, and Swagger is disabled when `NODE_ENV=production`.
- The API validates its environment at start-up and fails fast with a clear message.

## Foundation scope and known limitations

- The database currently holds only the academic-structure tables (Module 1) and they are **empty**: no university, session or syllabus data has been loaded. Verified NU data must come from the official source document.
- Firebase Authentication/Storage, the AI/RAG assistant, server-side authorization and the content
  workflow (Draft -> Academic Review -> Approval -> Publication) are not implemented.
- Bangla strings in the placeholder screens are unreviewed and must be checked by an academic or
  language reviewer before real use.
- Docker files are development-only; a production build is a later phase.

Project documents are in [`docs/`](./docs); architecture decisions are recorded in [`docs/adr`](./docs/adr).