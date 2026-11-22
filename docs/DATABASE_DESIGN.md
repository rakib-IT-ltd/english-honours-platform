# Database Design

Diagram: [`database/documentation/ERD.md`](../database/documentation/ERD.md). Conventions:
[`DATABASE_RULES.md`](../database/documentation/DATABASE_RULES.md). Decision record:
[`docs/adr/0002-academic-structure.md`](./adr/0002-academic-structure.md).

## Implemented (Module 1 - Academic structure)

`University`, `Department`, `AcademicYear` (Honours Year 1-4), `AcademicSession`, `Syllabus`,
`SyllabusSource`, `SyllabusVerification`. Migration: `20261120213500_academic_structure`.

## Not yet designed

Courses, topics, authors, literary works, learning resources, content workflow (Draft -> Academic
Review -> Approval -> Publication), question bank, users and progress. Each is designed when its
module is approved.
