# academic-content

Source material for the platform: official syllabus documents, references, content guidelines and
reviewed teaching content. **No syllabus documents have been added yet.**

## Syllabus folder layout

```
syllabus/<university>/<session>/<program>/<level>/
syllabus/national-university/2024-2025/english-honours/honours-1/   (and honours-2 ... honours-4)
syllabus/national-university/legacy/                                (older syllabuses, not current)
syllabus/university-of-dhaka/                                       (empty: no official DU document yet)
```

Levels are the five shared platform levels (`honours-1` ... `honours-4`, `masters-1`); everything
above the level folder is university-specific. A new university gets its own top-level folder.

Rules (from `CLAUDE.md`): keep the original source document and a verification record next to any
syllabus data; never mark unverified courses as verified; never assume NU and DU are identical;
legacy syllabuses are not assumed to be current.

## Loaded content and its status

| University | Program         | Session   | Levels               | What is loaded             | Status                                                                                           |
| ---------- | --------------- | --------- | -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| NU         | English Honours | 2024-2025 | Honours 1st-4th Year | 32 subject names and codes | **Unverified**: from a secondary website list supplied by the owner, not an official NU document |

Loaded from `database/prisma/content/*.sql` with `pnpm db:load-content`. To mark a version verified,
add the official NU document as a `SyllabusSource` (`OFFICIAL_UNIVERSITY_DOCUMENT`), compare every
subject name and code against it, then run the verify step. Credits, marks and book lists are still
to be added from the official document.
