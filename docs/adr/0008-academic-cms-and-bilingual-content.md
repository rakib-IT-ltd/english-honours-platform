# ADR 0008 - Academic CMS and section-level bilingual content

Status: **approved in principle by the owner on 2026-11-27. Phase 0 only is authorised** (this ADR,
ADR 0009, the content export/restore commands). No migration or application change has been made
for it. Phase 1 starts only after the owner has reviewed the Phase 0 deliverables.

The full proposal (with the verified code findings) is `CMS_AND_BILINGUAL_PLAN.md` in the project
documents. This ADR records the decisions and the owner's clarifications.

## Context

Verified in the code at the inspected state (content identical to commit `bdd2d1a`; on GitHub it is
`02e76b3`, the same files with different commit hashes because patches were applied as new commits):

- Only `UserRole.STUDENT` exists. `backend/api/src/admin` and `content-reviews` are empty; the admin
  pages of the website are placeholders.
- `StudyItem` keeps English and Bangla text in one row, and only the **section** has a publication
  status. English and Bangla cannot be reviewed or published separately, and editing overwrites text.
- `publish-study` requires a reviewer name but only prints it; no review record exists.
- The website uses the interface language to choose the content language (the two are coupled).
- No ETag/caching/sync, no rate limiting, and the free hosting has no dependable backup.

The owner wants to manage all academic material without code, authorise professors, keep final
control over what students see, and have English and Bangla linked but independent.

## Decisions

1. **Stable unit, revisions per language.** `StudyItem.id` becomes the stable content ID. A new
   `ContentRevision` table holds one row per (unit, language, version) with its own status, author,
   reviewer, comment and timestamps. No duplicate unrelated materials; English and Bangla are linked
   by the unit id.
2. **Independent languages (owner requirement 7).** A revision belongs to exactly one language.
   Submitting, rejecting, editing, approving, publishing, withdrawing or restoring one language never
   reads or writes the other language's revisions. The database enforces one PUBLISHED revision and
   one open working copy **per (unit, language)** (partial unique indexes). Example: English Critical
   Analysis published, Bangla version rejected: students keep seeing the published English text.
   Tests in Phase 3 assert this for every transition.
3. **History is never overwritten.** Publishing adds a new row and marks the previous published one
   `SUPERSEDED`. Every transition is an append-only `ContentEvent`. Restoring an old version creates a
   new revision with the old text, then publishes it.
4. **Workflow:** Draft -> Submitted -> In review -> Approved -> Published; Rejected -> feedback ->
   editor reopens and revises -> resubmitted. **"Approve & Publish" is the default Owner action;
   "Approve Only" is also offered for content to be published later** (owner decision 3). The server
   owns the state machine (ADR 0009).
5. **Original text (owner decision 1).** Switching an original literary text to Bangla shows its
   linked **Bangla explanation**, labelled as an explanation and not a translation. The English
   original is preserved and authoritative. Link: `StudyItem.supportsItemId`.
6. **Two language settings.** Interface language (existing `User.preferredLanguage`) and Academic
   Content Language (new `User.contentLanguage`). Neither changes the other. Every content unit has
   its own EN | Bangla switch; the choice for one unit never changes the others. The API returns both
   published languages of a unit so switching is instant and works offline.
7. **Missing Bangla:** show the English text with a visible "Bangla not available yet" notice. Never an
   empty block, never an unreviewed or machine translation. AI drafts, if ever used, enter only as
   `DRAFT` with origin `AI_DRAFT`.
8. **Terminology (owner decision 6).** User-facing and admin text says **"Academic Texts"**, not
   "books". The platform will hold essays, poems, novels, short stories, plays, literary criticism and
   other materials. The existing `Book` table is reused internally for now (it already has `genre`);
   a `kind` column and the renaming of API paths are decided when Phase 1 is designed in detail. The
   current student pages keep their wording until then.
9. **Structure editing (owner decision 2).** Only the Owner manages universities, programs, levels,
   courses, syllabuses, Academic Texts and their structure. Professors edit only assigned materials.
10. **Editor (owner decision 4).** A simple, secure formatted editor without new dependencies:
    headings, paragraphs, lists, quotations, bold/italic, verse line breaks, and a student preview that
    uses the same renderer as the student pages. Content is stored as a restricted Markdown subset and
    never rendered as raw HTML.
11. **Sync.** Website and Android app use the same public API; no content is bundled in either.
    `BookSection.contentUpdatedAt`, a manifest endpoint, ETags and tombstones for withdrawn content.
12. **Backups (owner decision 5).** Before real professors and students depend on the system there
    must be dependable automated backups and a **tested** restore procedure.
    `docs/BACKUP_AND_RESTORE.md` records the plan; the export/restore commands are delivered in
    Phase 0 and were tested on a scratch database.
13. **Safe database changes.** Expand -> migrate -> contract; only new migrations; the Phase 1
    migration must be rehearsed on a restored copy of the real data and a before/after comparison of
    the public API must be identical.

## Phases

0 ADRs + export/restore (this) | 1 migration and public API reads revisions | 2 student bilingual UI |
3 admin API and permissions | 4 admin web and editor | 5 Owner review, diff, publish, restore |
6 staff management | 7 structure editing (Owner only) | 8 sync/offline | 9 hardening.

## Consequences

- More tables and a stricter write path; in return full history, audit and independent languages.
- Free hosting remains suitable only for trying the CMS until backups are in place (decision 12).
- Until Phase 1, nothing changes for students or for the existing content commands.
