# ADR 0003 - Multi-university structure with shared academic levels

- Status: **Accepted by the owner** (scope update, 2026-11-22). Open confirmations are listed below.
- Date: 2026-11-22
- Supersedes (in part): [ADR 0002](./0002-academic-structure.md)

## Context

NU and DU are both supported from launch. Both use the same five levels (Honours 1st-4th Year,
Masters 1st Year) but differ in course titles, codes, credits, marks, content, sessions and syllabus
versions. ADR 0002 modelled years per department, which implied NU-style Honours years only.

## Decision

`University -> Academic Program -> Academic Level -> Syllabus Version -> Courses -> ...`

- `AcademicLevel`: five global rows, stored once.
- `AcademicProgram` (per university and department): English Honours (4 years) and English Masters
  (1 year) are separate programs. `ProgramLevel` lists which shared levels each program offers.
- `Syllabus` (version) = university + program + level + session + version label. Composite foreign
  keys on `universityId` let PostgreSQL reject a program or session from another university, and a
  level the program does not offer. `universityId` is denormalised on `Syllabus` for that purpose.
- `SyllabusSource.sourceType` separates official university documents from other sources; only
  official documents can support `VERIFIED`.
- The existing migration is untouched; a new migration drops `AcademicYear`, adds the new tables and
  inserts the five levels. It refuses to run if `Syllabus` or `AcademicYear` hold rows (nothing was
  loaded yet, so no data migration is needed).
- API: `/academic-levels` (shared), `/academic-programs`; syllabus filtered by university, program,
  level, session. No write endpoints (authentication still pending).

## Consequences

- Adding a university means adding rows, not code or schema.
- A student's identity (university, program, level, session) maps directly to one syllabus version.
- Courses, topics and materials will attach to `Syllabus` and are therefore always university-specific.
- Same-university integrity is enforced by the database, not only by services.
- Level names are reference data in a migration; changing them needs a new migration.

## To confirm with the owner

- Masters level: English name "Masters 1st Year" (clarification) vs Bangla "মাস্টার্স ফাইনাল"
  (later answer). Both are stored as given; code `MASTERS_1`.
- Bangla names of the levels and of "Department of English" are unreviewed (Bangla department name
  not supplied; `nameBn` is empty).
- A flag marking the current syllabus version per program/level/session was not added.
