# ADR 0005: Student journey - syllabus page and book pages

Status: accepted (owner asked for it; implemented, awaiting owner testing).

## Decision

- Choosing a level on the home page opens a **syllabus page** (`/syllabus?university&program&level`)
  showing university, department, program, level, the current syllabus version with its verification
  status, the course list and the book list. Choosing a book opens a **book page** (`/book?id`).
- Query parameters (not path segments) so the pages also work in the static GitHub Pages export.
- New tables `Course` (per syllabus version) and `Book` (per course), each with a publication status
  that follows the content workflow. The public API serves only `PUBLISHED` rows.
- No syllabus, course or book data is created by this change. Pages show clear empty states until
  verified content is loaded from official documents.

## Consequences

- Courses are not shared between universities or versions, so a change in one syllabus never alters
  another.
- Authoring and review of courses and books (admin and reviewer roles) is a later module; until then
  content can only be loaded by migration or script.
- Notes, summaries and questions per book are shown as "coming soon".
