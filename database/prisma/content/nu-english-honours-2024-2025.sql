-- NU English Honours, session 2024-2025: subject names and codes for Honours 1st-4th Year.
--
-- SOURCE AND STATUS (read before changing):
--   * The list was supplied by the project owner on 2026-11-24. It comes from a secondary website
--     (https://www.janteparo.com/2024/09/nu-honours-english-department-book-list.html), NOT from an
--     official National University document.
--   * So the syllabus versions are loaded as UNVERIFIED and the source is recorded as OTHER (the
--     API only counts OFFICIAL_UNIVERSITY_DOCUMENT sources toward verification).
--   * Only subject names and codes are included. Credits, marks and books are NOT known and stay
--     empty. Nothing here was added from memory.
--   * UPDATE 2026-11-25: the official NU First Year syllabus for 2024-2025 (nu.ac.bd, published
--     2025-11-12) differs from this list (for example it has History of Bangladesh: Language,
--     Culture and Identity 219901, ICT 219903 and ICT Lab 219904, and no Introduction to Social Work).
--     This list is therefore NOT trusted for session 2024-2025: the courses are loaded as DRAFT
--     (hidden from students) and the syllabus versions are not "current". Years 2-4 have no official
--     2024-2025 document yet. Replace with the official documents when supplied.
--   * Wording is as supplied; only trailing full stops and a website link were removed.
--
-- Safe to run repeatedly (existing rows are left alone). Requires the NU university and the
-- "english-honours" program to exist already (pnpm db:seed creates them for development).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "University" u
    JOIN "AcademicProgram" p ON p."universityId" = u.id
    WHERE u.code = 'nu' AND p.code = 'english-honours'
  ) THEN
    RAISE EXCEPTION 'University "nu" with program "english-honours" does not exist yet';
  END IF;
END $$;

INSERT INTO "AcademicSession" ("id", "universityId", "label", "startYear", "endYear", "updatedAt")
SELECT gen_random_uuid()::text, u.id, '2024-2025', 2024, 2025, now()
FROM "University" u
WHERE u.code = 'nu'
ON CONFLICT ("universityId", "label") DO NOTHING;

INSERT INTO "Syllabus" (
  "id", "universityId", "academicProgramId", "academicLevelId", "academicSessionId",
  "versionLabel", "verificationStatus", "notes", "isCurrent", "updatedAt"
)
SELECT gen_random_uuid()::text, u.id, p.id, l.id, s.id, '2024-2025', 'UNVERIFIED',
  'Subject names and codes only, from a secondary (non-official) list supplied by the project owner. Credits, marks and books not loaded. Not checked against an official NU document.',
  false, now()
FROM "University" u
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-honours'
JOIN "AcademicSession" s ON s."universityId" = u.id AND s.label = '2024-2025'
JOIN "AcademicLevel" l ON l.code IN ('HONOURS_1', 'HONOURS_2', 'HONOURS_3', 'HONOURS_4')
WHERE u.code = 'nu'
ON CONFLICT DO NOTHING;

INSERT INTO "SyllabusSource" ("id", "syllabusId", "sourceType", "title", "issuingBody", "documentRef")
SELECT gen_random_uuid()::text, sy.id, 'OTHER',
  'NU Honours English department subject list (names and codes)',
  'Not an official NU document: secondary website list supplied by the project owner',
  'https://www.janteparo.com/2024/09/nu-honours-english-department-book-list.html'
FROM "Syllabus" sy
JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
JOIN "AcademicSession" s ON s.id = sy."academicSessionId" AND s.label = '2024-2025'
JOIN "AcademicLevel" l ON l.id = sy."academicLevelId" AND l.code IN ('HONOURS_1', 'HONOURS_2', 'HONOURS_3', 'HONOURS_4')
WHERE sy."versionLabel" = '2024-2025'
  AND NOT EXISTS (
    SELECT 1 FROM "SyllabusSource" x
    WHERE x."syllabusId" = sy.id
      AND x."documentRef" = 'https://www.janteparo.com/2024/09/nu-honours-english-department-book-list.html'
  );

INSERT INTO "Course" ("id", "syllabusId", "code", "titleEn", "sequence", "publicationStatus", "updatedAt")
SELECT gen_random_uuid()::text, sy.id, v.code, v.title, v.sequence, 'DRAFT', now()
FROM (VALUES
    ('HONOURS_1', '211101', 'English Reading Skills', 1),
    ('HONOURS_1', '211103', 'English Writing Skills', 2),
    ('HONOURS_1', '211105', 'Introduction to Poetry', 3),
    ('HONOURS_1', '211107', 'Introduction to Prose: Fiction and Non-Fiction', 4),
    ('HONOURS_1', '212009', 'Introducing Sociology', 5),
    ('HONOURS_1', '212111', 'Introduction to Social Work', 6),
    ('HONOURS_1', '211909', 'Introduction to Political Theory', 7),
    ('HONOURS_1', '211501', 'History of the Emergence of Independent Bangladesh', 8),
    ('HONOURS_2', '221101', 'Introduction to Drama', 1),
    ('HONOURS_2', '221103', 'Romantic Poetry', 2),
    ('HONOURS_2', '221105', 'Advance Reading and Writing', 3),
    ('HONOURS_2', '221107', 'History of English Literature', 4),
    ('HONOURS_2', '221909', 'Political Organization and The Political System of UK and USA', 5),
    ('HONOURS_2', '222009', 'Sociology of Bangladesh', 6),
    ('HONOURS_2', '222115', 'Bangladesh Society and Culture', 7),
    ('HONOURS_3', '231101', 'Elizabethan and Jacobean Drama', 1),
    ('HONOURS_3', '231103', '16th and 17th Century Poetry', 2),
    ('HONOURS_3', '231105', '17th and 18th Century Non-Fictional Prose', 3),
    ('HONOURS_3', '231107', 'Restoration and Eighteenth Century Fiction', 4),
    ('HONOURS_3', '231109', 'Restoration and Eighteenth Century Poetry and Drama', 5),
    ('HONOURS_3', '231111', 'Victorian Poetry', 6),
    ('HONOURS_3', '231113', 'Introduction to Literary Criticism (Up to Romantic Period)', 7),
    ('HONOURS_3', '231115', 'Introduction to Linguistics', 8),
    ('HONOURS_4', '241101', 'Nineteenth Century Novel', 1),
    ('HONOURS_4', '241103', 'Twentieth Century Poetry', 2),
    ('HONOURS_4', '241105', 'Modern Drama', 3),
    ('HONOURS_4', '241107', 'Twentieth Century Novel', 4),
    ('HONOURS_4', '241109', 'American Poetry', 5),
    ('HONOURS_4', '241111', 'American Literature: Fiction and Drama', 6),
    ('HONOURS_4', '241113', 'Classics in Translation', 7),
    ('HONOURS_4', '241115', 'Literary Criticism (From Victorian to Modern Age)', 8),
    ('HONOURS_4', '241120', 'Viva-voce', 9)
) AS v(level_code, code, title, sequence)
JOIN "AcademicLevel" l ON l.code = v.level_code
JOIN "University" u ON u.code = 'nu'
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-honours'
JOIN "Syllabus" sy ON sy."universityId" = u.id
  AND sy."academicProgramId" = p.id
  AND sy."academicLevelId" = l.id
  AND sy."versionLabel" = '2024-2025'
ON CONFLICT ("syllabusId", "code") DO NOTHING;
