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

### Changed

- NU English Masters 2013-2014 is now **Verified** (owner confirmed the transcription; recorded in
  `SyllabusVerification`) and five misspelled names were corrected with the owner's approval
  (the stored original document keeps the printed spellings).
- NU English Honours "2024-2025" subject list is **hidden** (courses DRAFT, syllabus not current):
  the official NU First Year 2024-2025 syllabus (nu.ac.bd, published 2025-11-12) lists different
  courses (e.g. 219901 History of Bangladesh: Language, Culture and Identity, 219903 ICT, 219904 ICT
  Lab) than the secondary-website list that had been loaded. Waiting for the official documents.

### Added

- NU English Honours **Second Year 2024-2025** loaded from the official NU PDF (10 papers, 850 marks /
  34 credits; class hours and 55 English-language books for the 6 detailed papers). First and Second
  Year are now marked **Verified** on the owner's instruction (`zz-verification.sql`); 3rd and 4th
  Year stay hidden and unverified.

- NU English Honours **First Year 2024-2025** loaded from the official NU PDF (10 courses with credits,
  marks, class hours and 65 listed books), shown as "Not yet verified"; original stored with SHA-256.
  Years 2-4 stay hidden until official documents are supplied.

- NU English Masters (one-year), Masters Final, session 2013-2014 : 9 papers
  with credits (total 32) and class hours, and the 34 texts listed in the detailed syllabus as the
  book list. Source is the OFFICIAL NU syllabus document, stored with its SHA-256 under
  `academic-content/syllabus/national-university/2013-2014/english-masters/masters-final/`. Loaded as
  `UNVERIFIED` until a named reviewer compares it with the original. Not assumed to apply to later
  sessions: the syllabus page now shows the session. New optional `Course.classHours` (migration
  `20261124100000_course_class_hours`). Marks are not stated in the document and stay empty.

- NU English Honours 2024-2025 subjects (names and codes only): 8 + 7 + 8 + 9 = 32 courses for
  Honours 1st-4th Year, loaded by `pnpm db:load-content` from
  `database/prisma/content/nu-english-honours-2024-2025.sql`. Source: a list from the
  janteparo.com website supplied by the owner - NOT an official NU document - so every syllabus
  version is `UNVERIFIED` and the source is recorded as `OTHER`. Credits, marks and books are not
  loaded (not provided). The owner chose to show these to students labelled "Not yet verified".
  The Codespaces script now runs `db:load-content` after the seed.

- Syllabus page redesigned to the owner's mockup: breadcrumb, university banner (initials badge,
  no logo), tabs (Syllabus & Book List, Course Details, Study Resources), syllabus overview, book list
  with course filter and "View Details". Phone menu (hamburger). Sample names, authors, publishers,
  credits and marks from the mockup are NOT used; only real database content is shown.
- `scripts/apply-patch.ps1`: applies the newest patch, commits and pushes from any folder.

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
