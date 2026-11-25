-- Verification of the NU English Honours 2024-2025 syllabuses that were loaded from an official NU
-- document (currently First and Second Year). The project owner instructed on 2026-11-25 that
-- these are to be marked verified, like the Masters syllabus. A verification record is written
-- together with the status change, and only for a syllabus that has an official source document
-- and is current. Years without an official document (3rd, 4th) are never touched. Runs last
-- (file-name order). Safe to run repeatedly.

INSERT INTO "SyllabusVerification" ("id", "syllabusId", "verifiedBy", "note")
SELECT gen_random_uuid()::text, sy.id, 'Project owner',
  'Owner confirmed the loaded syllabus (2026-11-25), loaded from the official NU document stored in academic-content/.'
FROM "Syllabus" sy
JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
JOIN "AcademicProgram" p ON p.id = sy."academicProgramId" AND p.code = 'english-honours'
WHERE sy."versionLabel" = '2024-2025'
  AND sy."verificationStatus" = 'UNVERIFIED'
  AND sy."isCurrent"
  AND EXISTS (
    SELECT 1 FROM "SyllabusSource" x
    WHERE x."syllabusId" = sy.id AND x."sourceType" = 'OFFICIAL_UNIVERSITY_DOCUMENT'
  );

UPDATE "Syllabus" sy
SET "verificationStatus" = 'VERIFIED', "updatedAt" = now()
FROM "University" u, "AcademicProgram" p
WHERE u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-honours'
  AND sy."versionLabel" = '2024-2025'
  AND sy."verificationStatus" = 'UNVERIFIED'
  AND EXISTS (SELECT 1 FROM "SyllabusVerification" v WHERE v."syllabusId" = sy.id);
