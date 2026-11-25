-- Hides the NU English Honours "2024-2025" list from students (2026-11-25). See the UPDATE note in
-- nu-english-honours-2024-2025.sql: the list came from a secondary website and the official NU First
-- Year 2024-2025 syllabus contradicts it. Runs after that file; safe to run repeatedly. Nothing is
-- deleted: the rows stay as DRAFT so the history is kept.

UPDATE "Course" c
SET "publicationStatus" = 'DRAFT', "updatedAt" = now()
FROM "Syllabus" sy, "University" u, "AcademicProgram" p
WHERE c."syllabusId" = sy.id
  AND u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-honours'
  AND sy."versionLabel" = '2024-2025'
  AND c."publicationStatus" = 'PUBLISHED';

UPDATE "Syllabus" sy
SET "isCurrent" = false,
    "notes" = 'Hidden 2026-11-25: unofficial subject list that conflicts with the official NU First Year 2024-2025 syllabus. Awaiting the official documents.',
    "updatedAt" = now()
FROM "University" u, "AcademicProgram" p
WHERE u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-honours'
  AND sy."versionLabel" = '2024-2025'
  AND sy."isCurrent";
