# Changelog

## Unreleased

### Added (production backup architecture - design only)

- `docs/BACKUP_ARCHITECTURE.md` and ADR 0010: the proposed production backup system (private Google Cloud
  Storage bucket in a separate project, Cloud KMS envelope encryption, nightly jobs with automatic
  verification, least-privilege access, recovery procedure and kit, cost estimate, restoration test plan).
  **Nothing has been created or automated**; it waits for the owner's review. `BACKUP_AND_RESTORE.md` now
  points to it.

### Added (Phase 0 of the Academic CMS: decisions, export and restore)

- ADR 0008 (Academic CMS and section-level bilingual content) and ADR 0009 (roles, permissions and
  enforcement of the approval rules), recording the owner's approval in principle and his decisions.
  Nothing else is implemented yet: no migration and no change to the website or API.
- `pnpm db:export-content` (full JSON export with per-table checksums; `-- --content-only` leaves out
  students' data) and `pnpm db:restore-content` (restores into a migrated database in one
  transaction, refuses without `--confirm-database <name>`, verifies every table against its checksum
  before committing). `scripts/restore.sh` restores a `scripts/backup.sh` dump into an empty
  database. `docs/BACKUP_AND_RESTORE.md` has the procedure, the test results and the plan for
  automated off-site backups. Tested on a scratch PostgreSQL database; 22 new unit tests.

### Added (second study book: Tradition and Individual Talent) and justified reading text

- NU Masters 311111 (Prose), "Tradition and Individual Talent" (T. S. Eliot): 3 sections (Eliot's
  Parts I-III) loaded as **DRAFT** from the two supplied PDFs - 21 original-text paragraphs (checked
  word for word against the full-text PDF), Bangla explanations, summaries, central ideas, 9
  quotations with Bangla meaning, 9 terms (as Vocabulary), critical analysis and 35 practice
  questions without answers. Sources and SHA-256 in
  `academic-content/literature/tradition-and-the-individual-talent/`, with reviewer points (the first
  quotation is not Eliot's exact wording). Publish after review with
  `pnpm db:publish-study -- "Tradition and Individual Talent" --reviewed-by "Name"`.
- Study reading text is now justified (straight right edge), English with hyphenation and Bangla
  without; verse and epigraphs keep their line breaks and are not justified. All study buttons share
  one height, and a lone action button spans the full row.

### Added (free-tier online hosting)

- `render.yaml` (Render Blueprint: API + static website), `docs/DEPLOYMENT.md` step-by-step guide with
  Neon and Firebase, ADR 0007. `next.config.ts`: `STATIC_EXPORT=true` builds the website as a static
  site without a sub-path (the GitHub Pages build is unchanged).

### Added (first study material: The American Scholar)

- NU Masters 311111 (Prose), "The American Scholar" (Emerson): 5 sections loaded as **DRAFT** from the
  two supplied PDFs - original text (46 paragraphs, checked word for word against the full-text PDF),
  Bangla explanations, summaries, central ideas, quotations with Bangla meaning, critical analysis
  and 25 practice questions. Sources and SHA-256 in `academic-content/literature/the-american-scholar/`.
- The notes are unattributed and unofficial, carry no written answers and no vocabulary; none were
  invented. Questions show "No answer has been added yet."
- `pnpm db:publish-study -- "The American Scholar" --reviewed-by "Name"` publishes a book's draft
  sections after review (a reviewer name is required). Re-loading content never changes status.

### Changed (study centre layout)

- Syllabus book list: the "View Details" button is replaced by "Study centre".
- Resource options are a wrapped, equal-size grid (no side-to-side scrolling) and are no longer shown
  on the My Notes page; all study buttons share one height. Study centre back link returns to the
  syllabus.

### Added (study centre)

- Study centre for a book (mobile first, navy header, bottom navigation): resource tiles in the
  approved pastel colours, structure list, reading progress, guided section-by-section reading with
  resource tabs (original text, Bangla explanation, summary, analysis, quotations, Q&A, vocabulary,
  central ideas), bookmarks, personal notes, previous/next and completion. Pages `/study`,
  `/study/resource`, `/study/read`; the book page links to it when study material exists.
- Database: `BookSection`, `StudyItem`, `Bookmark`, `StudyNote`, `SectionProgress`, `Book.genre`
  (migration `20261125100000_study_content`). API: `/books/:id/sections`, `/sections/:id`,
  `/books/:id/resources/:kind`, `/me/study/...`.
- No real study content is included. A clearly labelled development sample
  (`pnpm db:load-sample`, never in production) lets the screens be tried in the Codespace.
- Fixed: CORS now allows `DELETE`.

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
