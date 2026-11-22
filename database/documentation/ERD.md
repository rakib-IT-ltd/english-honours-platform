# Entity Relationship Diagram

Module 1 - Academic structure. Every relation is a required foreign key with `ON DELETE RESTRICT`
(academic records are never removed implicitly).

```mermaid
erDiagram
  University ||--o{ Department : has
  University ||--o{ AcademicSession : has
  Department ||--o{ AcademicYear : "has (Honours Year 1-4)"
  AcademicSession ||--o{ Syllabus : "covers"
  AcademicYear ||--o{ Syllabus : "covers"
  Syllabus ||--o{ SyllabusSource : "taken from"
  Syllabus ||--o{ SyllabusVerification : "checked by"

  University { string id PK  string code UK  string nameEn  string nameBn "nullable" }
  Department { string id PK  string universityId FK  string code  string nameEn  string nameBn "nullable" }
  AcademicYear { string id PK  string departmentId FK  int yearNumber "1..4"  string nameEn  string nameBn "nullable" }
  AcademicSession { string id PK  string universityId FK  string label  int startYear  int endYear }
  Syllabus { string id PK  string academicSessionId FK  string academicYearId FK  string versionLabel  enum verificationStatus "UNVERIFIED | VERIFIED" }
  SyllabusSource { string id PK  string syllabusId FK  string title  string issuingBody  string documentRef  date publishedOn "nullable"  string sha256 "nullable" }
  SyllabusVerification { string id PK  string syllabusId FK  string verifiedBy  string note "nullable"  datetime verifiedAt }
```

Unique keys: `University.code`; `(universityId, code)` on Department; `(departmentId, yearNumber)` on
AcademicYear; `(universityId, label)` on AcademicSession; `(academicSessionId, academicYearId,
versionLabel)` on Syllabus.
