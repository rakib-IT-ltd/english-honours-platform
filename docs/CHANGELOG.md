# Changelog

## Unreleased

### Changed

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

- Website home page: bilingual (English first, Bangla switch) university -> program -> level
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
