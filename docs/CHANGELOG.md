# Changelog

## Unreleased

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
