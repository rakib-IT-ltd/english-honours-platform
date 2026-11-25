-- Verification of the NU English Masters 2013-2014 syllabus.
-- The project owner confirmed on 2026-11-25 that the loaded papers, credits, class hours and texts
-- match the official document (original stored in academic-content/syllabus/national-university/
-- 2013-2014/english-masters/masters-final/). A verification record is written together with the
-- status change, and only for a syllabus that has an official source document. Runs after
-- nu-english-masters-2013-2014.sql. Safe to run repeatedly.

INSERT INTO "SyllabusVerification" ("id", "syllabusId", "verifiedBy", "note")
SELECT gen_random_uuid()::text, sy.id, 'Project owner',
  'Owner confirmed the transcription against the official NU document (2026-11-25). Five misspelled names were corrected with the owner''s approval.'
FROM "Syllabus" sy
JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
JOIN "AcademicProgram" p ON p.id = sy."academicProgramId" AND p.code = 'english-masters'
WHERE sy."versionLabel" = '2013-2014'
  AND sy."verificationStatus" = 'UNVERIFIED'
  AND EXISTS (
    SELECT 1 FROM "SyllabusSource" x
    WHERE x."syllabusId" = sy.id AND x."sourceType" = 'OFFICIAL_UNIVERSITY_DOCUMENT'
  );

UPDATE "Syllabus" sy
SET "verificationStatus" = 'VERIFIED', "updatedAt" = now()
FROM "University" u, "AcademicProgram" p
WHERE u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-masters'
  AND sy."versionLabel" = '2013-2014'
  AND sy."verificationStatus" = 'UNVERIFIED'
  AND EXISTS (SELECT 1 FROM "SyllabusVerification" v WHERE v."syllabusId" = sy.id);
