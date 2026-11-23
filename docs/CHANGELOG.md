# Changelog

## Unreleased

### Changed

- Home page: removed the Bangla title line; mobile layout reworked (single-column header, scrollable
  menu, 44px tap targets, hidden illustration on phones).

- Scope update: NU and DU are supported from launch. The per-department `AcademicYear` table is
  replaced by five shared `AcademicLevel` rows; new `AcademicProgram` and `ProgramLevel` tables;
  `Syllabus` now belongs to one university, program, level and session (composite foreign keys keep
  them consistent). New migration `20261122100000_multi_university_levels` (the first migration is
  unchanged). API: `/academic-years` replaced by `/academic-levels`; new `/academic-programs`;
  syllabus filters changed. Verification now requires an official university source document.
  `CLAUDE.md`, SRS, master document, database docs and ADR 0003 updated.
- Fifth shared level renamed to "Masters Final" (code `MASTERS_FINAL`) via a new migration.
- `academic-content/syllabus/` reorganised to `<university>/<session>/<program>/<level>`; the DU
  folder holds only a README.

### Added

- Student journey (ADR 0005): choosing a level on the home page opens `/syllabus` (university,
  department, program, level, current syllabus version, courses, book list); choosing a book opens
  `/book`. New tables `Course` and `Book` with a `PublicationStatus` (Draft, In review, Approved,
  Published) - migration `20261123200000_courses_and_books`. New read-only API: `/courses`,
  `/books` (published content only). No courses or books are loaded: the pages show honest empty
  states until verified content is added.
- Step 2 shows the department ("Department of English") under the program choices.

- Authentication and student profile (ADR 0004): email + password sign-in through Firebase
  Authentication (Firebase Auth Emulator for development; no Firebase account needed now). API:
  `GET /me`, `PATCH /me`, `PUT /me/profile` behind a bearer ID token. New migration
  `20261123100000_users_and_student_profiles` (`User`, `StudentProfile`). Website: `/register`,
  `/login`, `/profile`. `scripts/codespaces-dev.sh` now also starts the emulator. Bangla strings are
  a first draft and need review.

- Development seed (`pnpm db:seed`, `database/prisma/seed/universities.sql`): names only - NU, DU,
  "Department of English", English Honours (4 years) and English Masters (1 year) programs linked to
  their shared levels. Idempotent; no syllabus, course, session or Bangla data. Plus
  `scripts/codespaces-dev.sh` to run the stack in a Codespace.

- Website home page (owner-approved layout): navy header, hero, step cards for university -> program -> level (English first, Bangla switch),
  selector fed by the API, with honest empty/not-connected states and verification badge. No
  university, course or syllabus is hardcoded; the static GitHub Pages preview shows the
  "not connected" notice because it has no API.

- `Syllabus.isCurrent` flag (migration `20261122130000_current_syllabus_version`): at most one current
  version per program, level and session (partial unique index); `GET /syllabuses?isCurrent=true`.
  Setting it is a write operation and waits for the admin module.

- GitHub Actions CI (quality checks + migration/schema drift check); VS Code and Codespaces dev
  container configuration.

- Module 1 - Academic structure: Prisma models + migration, read-only API for universities,
  departments, academic years, academic sessions and syllabuses, and the tested syllabus verification
  rule (source document required). No data seeded.

- Project foundation: pnpm monorepo, NestJS API (health endpoints, Swagger, validated config),
  Next.js placeholder, Flutter placeholder sources, shared types package, Prisma 7 configuration
  without models, Docker development stack, `.env.example` templates, test configurations.
- Repository layout aligned with the approved structure (`backend/`, `database/`,
  `academic-content/`, `ai-services/`, `infrastructure/`, `scripts/`).
