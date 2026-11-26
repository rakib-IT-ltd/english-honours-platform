# ADR 0006: Study centre - sections, resources, bookmarks, notes and progress

Status: accepted (owner supplied the design screenshots; implemented, awaiting owner testing).

## Decision

- A book has **sections** (`BookSection`: chapters or parts, for guided reading). Each section has
  **study items** (`StudyItem`) of eight kinds: original text, Bangla explanation, summary, critical
  analysis, quotation, question and answer, vocabulary, central idea. All academic content lives in
  the database; the website contains no study text.
- Items have no workflow status of their own: the **section** carries the publication status
  (`DRAFT` -> ... -> `PUBLISHED`). A section is public only when it, its book and the book's course
  are all `PUBLISHED`.
- The student's own data is separate and private: `Bookmark`, `StudyNote` (one note per section,
  1-5000 characters) and `SectionProgress` (opened and completed). Reading needs no account; saving
  does (Firebase sign-in, `/me/study/...`).
- Screens (query parameters, mobile first, also work in the static preview): study centre
  `/study?book`, one resource across sections `/study/resource?book&kind`, guided reading
  `/study/read?book&section&view`. The eight resources use the approved soft pastel colours.
- **No fake academic content.** Real study material stays empty until reviewed content is loaded
  from `database/prisma/content/`. For trying the screens there is a clearly labelled **development
  sample** (`database/prisma/dev-samples/`, `pnpm db:load-sample`, refused in production, every
  section `isSample = true` and shown with a "Sample content" label). The Codespace script loads it;
  production never does.

## Consequences

- Buttons for resources that have no material are shown as "Not available yet", not as empty pages.
- Course type (Core/Allied) and the study text of real books are later work.
- The API allows `DELETE` in CORS (needed for removing bookmarks and notes from the browser).
