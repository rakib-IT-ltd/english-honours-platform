# Master Project Document

> **Status:** summary only. Extended as each phase is approved. Authoritative rules: [`CLAUDE.md`](../CLAUDE.md).

## Vision

A bilingual (English/Bangla) academic ecosystem for English students in Bangladesh. **National
University (NU) and the University of Dhaka (DU) are both supported from launch.** The platform is
not NU-only, and further Bangladeshi universities must be addable without major architectural change.

## Academic model

`University -> Academic Program -> Academic Level -> Syllabus Version -> Courses -> Topics -> Learning Materials`

- **Shared:** five academic levels - Honours 1st, 2nd, 3rd, 4th Year and Masters 1st Year. They exist
  once and are reused by every university.
- **University-specific:** programs (e.g. English Honours, 4 years; English Masters, 1 year), academic
  sessions, syllabus versions, course titles, course codes, credit hours, marks and assessment
  structures, and syllabus content. NU and DU are never assumed to be identical.
- **Student academic identity:** university, academic program, academic level, applicable session.
- **Verification:** every syllabus version keeps its source documents and verification records.
  The only verified baseline is the official NU First Year syllabus, session 2024-2025 (not yet
  loaded). No DU information is verified or entered until an official DU document is recorded.

How NU and DU are represented: each is a `University` row with its own `Department of English`,
its own `AcademicProgram` rows, its own `AcademicSession` rows and its own `Syllabus` versions,
all pointing at the same five `AcademicLevel` rows. Details: [`adr/0003-multi-university-shared-levels.md`](./adr/0003-multi-university-shared-levels.md).

## Components

Android app (Flutter) · responsive website (Next.js) · administrative area · central API (NestJS) ·
PostgreSQL via Prisma · AI assistant with retrieval-augmented generation (later phase).

## Repository map

See the folder tree in the root [`README.md`](../README.md). Academic source material lives in
[`academic-content/`](../academic-content), never hardcoded in application code.

## Guiding rules

Academic accuracy first; never invent syllabus information; one module at a time; no fake academic
content in production; secrets only through environment variables; no NU-specific (or DU-specific)
assumptions in shared code.
