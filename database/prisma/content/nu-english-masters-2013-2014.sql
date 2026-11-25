-- NU English Masters (one-year), Masters Final, session 2013-2014: papers, credits, class hours and
-- the texts listed in the detailed syllabus.
--
-- SOURCE (official): "National University - Syllabus, Department of English - One-Year Master's
-- Course - Effective from the Session: 2013-2014" (English.doc from the archive
-- "Master's Final 2013-14pub_date_14122015" supplied by the project owner on 2026-11-24).
-- The original file is kept in
-- academic-content/syllabus/national-university/2013-2014/english-masters/masters-final/
-- (SHA-256 99b1acd2aa38832c9c6679f428caa308f4f0cf7ea2fb3dec8a8c222ab020928a).
--
-- STATUS: loaded as UNVERIFIED with the official document attached. It becomes VERIFIED only when
-- a named reviewer has compared this file with the official document and the verification is
-- recorded (POST /syllabuses/{id}/verify). Nothing is verified implicitly.
--
-- IMPORTANT: this syllabus is effective from session 2013-2014 only. It is NOT assumed to apply to
-- later sessions; the website shows the session next to it.
--
-- Wording, spelling and punctuation are as printed in the document (including spellings such as
-- "Heany", "Cresyde" and "Tennessee William"); corrections need the owner's approval.
-- Marks are not stated in the document, so they stay empty. "Class Hours" are stored as given.
-- The texts listed under each paper become the book list (author as printed; any edition or
-- selection note is kept in the description). The syllabus gives no publisher, edition or year.
-- Term Paper and Viva-Voce have no detailed syllabus and no class hours.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "University" u
    JOIN "AcademicProgram" p ON p."universityId" = u.id
    WHERE u.code = 'nu' AND p.code = 'english-masters'
  ) THEN
    RAISE EXCEPTION 'University "nu" with program "english-masters" does not exist yet';
  END IF;
END $$;

INSERT INTO "AcademicSession" ("id", "universityId", "label", "startYear", "endYear", "updatedAt")
SELECT gen_random_uuid()::text, u.id, '2013-2014', 2013, 2014, now()
FROM "University" u
WHERE u.code = 'nu'
ON CONFLICT ("universityId", "label") DO NOTHING;

INSERT INTO "Syllabus" (
  "id", "universityId", "academicProgramId", "academicLevelId", "academicSessionId",
  "versionLabel", "verificationStatus", "notes", "isCurrent", "updatedAt"
)
SELECT gen_random_uuid()::text, u.id, p.id, l.id, s.id, '2013-2014', 'UNVERIFIED',
  'Official NU syllabus for the One-Year Master''s Course, Department of English, effective from session 2013-2014. Transcribed from the original document; awaiting reviewer verification. Not assumed to apply to other sessions. Marks are not stated in the document.',
  true, now()
FROM "University" u
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-masters'
JOIN "AcademicSession" s ON s."universityId" = u.id AND s.label = '2013-2014'
JOIN "AcademicLevel" l ON l.code = 'MASTERS_FINAL'
WHERE u.code = 'nu'
ON CONFLICT DO NOTHING;

INSERT INTO "SyllabusSource" ("id", "syllabusId", "sourceType", "title", "issuingBody", "documentRef")
SELECT gen_random_uuid()::text, sy.id, 'OFFICIAL_UNIVERSITY_DOCUMENT',
  'Syllabus for One-Year Master''s Course, Subject: English, effective from the session 2013-2014',
  'National University, Bangladesh',
  'academic-content/syllabus/national-university/2013-2014/english-masters/masters-final/english-masters-syllabus-2013-14.doc (sha256 99b1acd2aa38832c9c6679f428caa308f4f0cf7ea2fb3dec8a8c222ab020928a)'
FROM "Syllabus" sy
JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
JOIN "AcademicSession" s ON s.id = sy."academicSessionId" AND s.label = '2013-2014'
JOIN "AcademicProgram" p ON p.id = sy."academicProgramId" AND p.code = 'english-masters'
WHERE sy."versionLabel" = '2013-2014'
  AND NOT EXISTS (
    SELECT 1 FROM "SyllabusSource" x
    WHERE x."syllabusId" = sy.id AND x."sourceType" = 'OFFICIAL_UNIVERSITY_DOCUMENT'
  );

INSERT INTO "Course" (
  "id", "syllabusId", "code", "titleEn", "credits", "classHours", "sequence",
  "publicationStatus", "updatedAt"
)
SELECT gen_random_uuid()::text, sy.id, v.code, v.title, v.credits, v.class_hours, v.sequence,
  'PUBLISHED', now()
FROM (VALUES
    ('311101', 'Chaucer', 4, 120, 1),
    ('311103', 'W. Shakespeare', 4, 120, 2),
    ('311105', 'Modern Poetry', 4, 120, 3),
    ('311107', 'Modern Drama', 4, 120, 4),
    ('311109', 'Modern Novel', 4, 120, 5),
    ('311111', 'Prose', 4, 120, 6),
    ('311113', 'South Asian and African Literature', 4, 120, 7),
    ('311114', 'Term Paper', 2, NULL, 8),
    ('311116', 'Viva-Voce', 2, NULL, 9)
) AS v(code, title, credits, class_hours, sequence)
JOIN "University" u ON u.code = 'nu'
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-masters'
JOIN "Syllabus" sy ON sy."universityId" = u.id
  AND sy."academicProgramId" = p.id
  AND sy."versionLabel" = '2013-2014'
ON CONFLICT ("syllabusId", "code") DO NOTHING;

INSERT INTO "Book" ("id", "courseId", "titleEn", "author", "description", "sequence", "publicationStatus", "updatedAt")
SELECT gen_random_uuid()::text, c.id, v.title, v.author, v.description, v.sequence, 'PUBLISHED', now()
FROM (VALUES
    ('311101', '''The General Prologue'' to The Canterbury Tales', 'Chaucer', NULL, 1),
    ('311101', '''The Nuns Priests Tale''', 'Chaucer', NULL, 2),
    ('311101', 'Troilus and Cresyde', 'Chaucer', NULL, 3),
    ('311103', 'Hamlet', 'W. Shakespeare', NULL, 4),
    ('311103', 'Othello', 'W. Shakespeare', NULL, 5),
    ('311103', 'King Lear', 'W. Shakespeare', NULL, 6),
    ('311103', 'Tempest', 'W. Shakespeare', NULL, 7),
    ('311103', 'Measure for Measure', 'W. Shakespeare', NULL, 8),
    ('311103', 'Julius Caesar', 'W. Shakespeare', NULL, 9),
    ('311105', '''Song of Myself''', 'W. Whitman', NULL, 10),
    ('311105', 'Selected poems', 'W. B. Yeats', 'ed. Norman Jeffares except the pieces included in the Honours Course', 11),
    ('311105', 'Poems', 'Robert Frost', 'as in Norton Anthology - except the pieces included in the Honours Course', 12),
    ('311105', 'Poems', 'W. H. Auden', 'as in Norton Anthology', 13),
    ('311105', 'Poems', 'Dylan Thomas', 'as in Norton Anthology excluding ''Fern Hill''', 14),
    ('311105', 'Poems', 'Seamus Heany', 'as in Norton', 15),
    ('311107', 'You Never Can Tell', 'G.B. Shaw', NULL, 16),
    ('311107', 'Desire Under the Elms', 'Eugene O'' Neil', NULL, 17),
    ('311107', 'Death of a Salesman', 'A. Miller', NULL, 18),
    ('311107', 'The Glass Menagerie', 'Tennessee William', NULL, 19),
    ('311109', 'The Old Man and the Sea', 'E. Hemingway', NULL, 20),
    ('311109', 'Lord of the Flies', 'W. Golding', NULL, 21),
    ('311109', 'The Scarlet Letter', 'N. Hawthorne', NULL, 22),
    ('311109', 'Brave New World', 'Aldous Huxley', NULL, 23),
    ('311109', 'Nausea', 'J. Paul Sartre', NULL, 24),
    ('311111', '''The American Scholar''', 'W. Emerson', NULL, 25),
    ('311111', '''Civil Disobedience''', 'H. D. Thoreau', NULL, 26),
    ('311111', '''Shakespeare''s Sister''', 'Virginia Woolf', NULL, 27),
    ('311111', '''Tradition and Individual Talent''', 'T.S. Eliot', NULL, 28),
    ('311111', '''Literature and Society''', 'F.R. Leavis', NULL, 29),
    ('311113', 'Tree Without Roots', 'S. Waliullah', NULL, 30),
    ('311113', 'The God of Small Things', 'Arundhati Roy', NULL, 31),
    ('311113', '"The Rebel", ''Of Equality and the Happy Land'', "Man", "Beware My Captain''', 'Kazi Nazrul Islam', 'as translated by Kabir Chowdhury and published in Poetry of Kazi Nazrul Islam (Volume One) published by Nazrul Institute, Bangladesh', 32),
    ('311113', 'Things Fall Apart', 'Chinua Achebe', NULL, 33),
    ('311113', 'Petals of Blood', 'Ngugi wa Thiong''o', NULL, 34)
) AS v(course_code, title, author, description, sequence)
JOIN "University" u ON u.code = 'nu'
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-masters'
JOIN "Syllabus" sy ON sy."universityId" = u.id
  AND sy."academicProgramId" = p.id
  AND sy."versionLabel" = '2013-2014'
JOIN "Course" c ON c."syllabusId" = sy.id AND c.code = v.course_code
WHERE NOT EXISTS (
  SELECT 1 FROM "Book" b
  WHERE b."courseId" = c.id AND b."titleEn" = v.title AND b.author IS NOT DISTINCT FROM v.author
);
