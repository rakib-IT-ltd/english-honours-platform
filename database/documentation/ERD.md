# Entity Relationship Diagram

Module 1 - Academic structure (multi-university). Every relation is a required foreign key with
`ON DELETE RESTRICT` (academic records are never removed implicitly).

```mermaid
erDiagram
  University ||--o{ Department : has
  University ||--o{ AcademicProgram : offers
  University ||--o{ AcademicSession : has
  University ||--o{ Syllabus : owns
  Department ||--o{ AcademicProgram : runs
  AcademicProgram ||--o{ ProgramLevel : "offers levels"
  AcademicLevel ||--o{ ProgramLevel : "shared by programs"
  ProgramLevel ||--o{ Syllabus : "for program + level"
  AcademicSession ||--o{ Syllabus : "covers"
  Syllabus ||--o{ SyllabusSource : "taken from"
  Syllabus ||--o{ SyllabusVerification : "checked by"

  University { string id PK  string code UK  string nameEn  string nameBn "nullable" }
  Department { string id PK  string universityId FK  string code  string nameEn  string nameBn "nullable" }
  AcademicLevel { string id PK  string code UK  int sequence UK  string nameEn  string nameBn "nullable" }
  AcademicProgram { string id PK  string universityId FK  string departmentId FK  string code  enum programmeType "HONOURS | MASTERS"  string nameEn  string nameBn "nullable" }
  ProgramLevel { string programId PK,FK  string levelId PK,FK }
  AcademicSession { string id PK  string universityId FK  string label  int startYear  int endYear }
  Syllabus { string id PK  string universityId FK  string academicProgramId FK  string academicLevelId FK  string academicSessionId FK  string versionLabel  enum verificationStatus "UNVERIFIED | VERIFIED"  boolean isCurrent }
  SyllabusSource { string id PK  string syllabusId FK  enum sourceType "OFFICIAL_UNIVERSITY_DOCUMENT | OTHER"  string title  string issuingBody  string documentRef  date publishedOn "nullable"  string sha256 "nullable" }
  SyllabusVerification { string id PK  string syllabusId FK  string verifiedBy  string note "nullable"  datetime verifiedAt }
```

`AcademicLevel` is the only table that is **not** per university: five shared rows.

Same-university guarantees (composite foreign keys, all including `universityId`):
`AcademicProgram(departmentId, universityId) -> Department`,
`Syllabus(academicProgramId, universityId) -> AcademicProgram`,
`Syllabus(academicSessionId, universityId) -> AcademicSession`, and
`Syllabus(academicProgramId, academicLevelId) -> ProgramLevel` (the program must offer the level).

Unique keys: `University.code`; `AcademicLevel.code` and `.sequence`; `(universityId, code)` on
Department and AcademicProgram; `(universityId, label)` on AcademicSession; `(programId, levelId)` is
the key of ProgramLevel; `(academicProgramId, academicLevelId, academicSessionId, versionLabel)` on
Syllabus. `(id, universityId)` is unique on Department, AcademicProgram and AcademicSession as the
target of the composite keys.
