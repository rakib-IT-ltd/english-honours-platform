-- Development seed: NAMES ONLY. Idempotent (safe to run repeatedly).
--
-- Creates the universities, their "Department of English" and their English programs, and links
-- each program to the shared academic levels it offers. It contains NO syllabus, course, session or
-- Bangla-name data: those must come from official documents / reviewed text (CLAUDE.md rules).
-- Run with `pnpm db:seed` after the migrations. Never run against production.

BEGIN;

INSERT INTO "University" ("id", "code", "nameEn", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'nu', 'National University', CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'du', 'University of Dhaka', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Department" ("id", "universityId", "code", "nameEn", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'english', 'Department of English', CURRENT_TIMESTAMP
FROM "University" u
WHERE u."code" IN ('nu', 'du')
ON CONFLICT ("universityId", "code") DO NOTHING;

INSERT INTO "AcademicProgram"
  ("id", "universityId", "departmentId", "code", "programmeType", "nameEn", "updatedAt")
SELECT gen_random_uuid()::text, d."universityId", d."id", p."code", p."programmeType"::"ProgrammeType",
       p."nameEn", CURRENT_TIMESTAMP
FROM "Department" d
JOIN "University" u ON u."id" = d."universityId" AND u."code" IN ('nu', 'du')
CROSS JOIN (VALUES
  ('english-honours', 'HONOURS', 'English Honours'),
  ('english-masters', 'MASTERS', 'English Masters')
) AS p ("code", "programmeType", "nameEn")
WHERE d."code" = 'english'
ON CONFLICT ("universityId", "code") DO NOTHING;

-- Honours programs offer Honours 1st-4th Year; Masters programs offer the Masters level.
INSERT INTO "ProgramLevel" ("programId", "levelId")
SELECT ap."id", l."id"
FROM "AcademicProgram" ap
JOIN "University" u ON u."id" = ap."universityId" AND u."code" IN ('nu', 'du')
JOIN "AcademicLevel" l
  ON (ap."programmeType" = 'HONOURS' AND l."code" IN ('HONOURS_1', 'HONOURS_2', 'HONOURS_3', 'HONOURS_4'))
  OR (ap."programmeType" = 'MASTERS' AND l."code" = 'MASTERS_FINAL')
ON CONFLICT DO NOTHING;

COMMIT;
