# ADR 0002 - Academic structure model (Module 1)

- Status: **Partly superseded by [ADR 0003](./0003-multi-university-shared-levels.md)** (the `AcademicYear` table and the year-based syllabus key; the rest still holds)
- Date: 2026-11-20

## Decision

Model universities, departments, Honours years, sessions and syllabuses as separate tables, with a
`Syllabus` identified by (session, academic year, version label). Source documents and verification
events are separate append-only records. Expose read-only HTTP endpoints only.

## Reasons

- Multiple universities, sessions and syllabus versions are supported from the first table, as
  required by `CLAUDE.md`; nothing about NU is hardcoded.
- `VERIFIED` can never be set without a source document and an audit record.
- No write endpoints yet: server-side authorization (Authentication module) must exist first, so
  data entry happens through reviewed seeds/migrations until the admin module is built.

## Consequences / open points

- `AcademicYear` is limited to 1..4 (the Honours programme). Other programme lengths would need a
  migration.
- `SyllabusVerification.verifiedBy` is free text until the users module exists, then becomes a user
  reference.
- Session/year same-university consistency is enforced in the future write service, not by the
  database.
