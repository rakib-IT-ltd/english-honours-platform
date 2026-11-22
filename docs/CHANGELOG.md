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
- `academic-content/syllabus/` reorganised to `<university>/<session>/<program>/<level>`; the DU
  folder holds only a README.

### Added

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
