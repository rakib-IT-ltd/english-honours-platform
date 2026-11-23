# Database Design

Diagram: [`database/documentation/ERD.md`](../database/documentation/ERD.md). Conventions:
[`DATABASE_RULES.md`](../database/documentation/DATABASE_RULES.md). Decision records:
[`adr/0002`](./adr/0002-academic-structure.md) (partly superseded) and
[`adr/0003`](./adr/0003-multi-university-shared-levels.md).

## Implemented (Module 1 - Academic structure, multi-university)

`University`, `Department`, `AcademicProgram`, `AcademicLevel` (shared), `ProgramLevel`,
`AcademicSession`, `Syllabus` (a syllabus version), `SyllabusSource`, `SyllabusVerification`.
Migrations: `20261120213500_academic_structure`, `20261122100000_multi_university_levels`.

- `AcademicLevel` is global: five rows (`HONOURS_1`..`HONOURS_4`, `MASTERS_FINAL`) created by the
  migration as reference data.
- `AcademicProgram` belongs to a university and its department; `ProgramLevel` says which shared
  levels the program offers.
- `Syllabus` = university + program + level + session + version label. Composite foreign keys make
  the database reject a program or session from another university, or a level the program does not
  offer.
- `SyllabusSource.sourceType` distinguishes `OFFICIAL_UNIVERSITY_DOCUMENT` from `OTHER`; only the
  former counts toward verification.

## Users and student profile

- `User`: one row per Firebase account (`firebaseUid`, `email` unique, optional `displayName`,
  `role` = `STUDENT`, `preferredLanguage` `en`/`bn` enforced by a CHECK). No password is stored.
- `StudentProfile` (one per user): university, program, level and optional session. Composite
  foreign keys make the database reject a program or session from another university and a level the
  program does not offer. The session is optional until real sessions exist.

## Not yet designed

Courses (titles, codes, credits, marks), topics, authors, literary works, learning resources,
content workflow (Draft -> Academic Review -> Approval -> Publication), question bank, progress. Each is designed when its module is approved. Courses will
attach to `Syllabus`, so they inherit the university.
