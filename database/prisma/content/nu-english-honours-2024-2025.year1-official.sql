-- NU English Honours, First Year, session 2024-2025: courses, credits, marks, class hours and the
-- "List of Books" of each course, taken from the OFFICIAL NU document.
--
-- SOURCE (official): "National University, Bangladesh - First Year Syllabus, Department of English,
-- Four-Year B.A. (Honors) Program, Effective from the Session: 2024-2025" (35 pages, file name
-- English_First_Year_Pub_Date_12112025.pdf), downloaded by the project owner and supplied on
-- 2026-11-25. The original is kept in
-- academic-content/syllabus/national-university/2024-2025/english-honours/honours-1st-year/
-- (SHA-256 2f4a8912863de132863ec5194fdc6f9eca3da63ad0800b244d8079597d9f50a3).
--
-- STATUS: loaded as UNVERIFIED with the official document attached; verification is recorded by
-- nu-english-honours-2024-2025.zz-verification.sql (owner's instruction of 2026-11-25). Only the First Year is loaded:
-- no official 2nd/3rd/4th year document has been supplied, and nothing is assumed for them.
--
-- Runs AFTER nu-english-honours-2024-2025.sql and .unpublish.sql (file-name order), which hid the
-- unofficial secondary-website list. This file replaces that list for the First Year only: codes
-- that match the official document are updated to the official values and published; old rows that
-- are not in the official document stay DRAFT (hidden, nothing deleted).
--
-- Notes on the document:
--  * Students take ONE of 211009 (Bangla Language and Literature), 212009 (Introducing Sociology)
--    or 211909 (Introduction to Political Science). Total 700 marks / 28 credits counts one of them.
--  * 211009 is written in Bangla in an old font that does not extract reliably; its 12 reference
--    books are therefore NOT loaded (to be added from a clean copy). Its title is shown in English
--    as given in the document and in Bangla as printed in the course title.
--  * Class hours are stated for 211101, 211103, 211105, 211107, 211009, 212009 and 219901 (60 each);
--    not stated for 211909, 219903 and 219904, so they stay empty.
--  * Wording of titles and authors is as printed (including "The Emergency of Bangladesh").
--    Political Organizations by J. Q. Wilson is printed twice in the 211909 list; loaded once.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Syllabus" sy
    JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
    JOIN "AcademicProgram" p ON p.id = sy."academicProgramId" AND p.code = 'english-honours'
    JOIN "AcademicLevel" l ON l.id = sy."academicLevelId" AND l.code = 'HONOURS_1'
    WHERE sy."versionLabel" = '2024-2025'
  ) THEN
    RAISE EXCEPTION 'NU English Honours 1st Year 2024-2025 syllabus row does not exist yet';
  END IF;
END $$;

UPDATE "Syllabus" sy
SET "notes" = 'Official NU First Year syllabus (Department of English, Four-Year B.A. Honors), effective from session 2024-2025. Students take one of Bangla Language and Literature, Introducing Sociology or Introduction to Political Science. Transcribed from the original document; not yet verified. Applies to session 2024-2025 only.',
    "isCurrent" = true,
    "updatedAt" = now()
FROM "University" u, "AcademicProgram" p, "AcademicLevel" l
WHERE u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-honours'
  AND l.id = sy."academicLevelId" AND l.code = 'HONOURS_1'
  AND sy."versionLabel" = '2024-2025';

INSERT INTO "SyllabusSource" ("id", "syllabusId", "sourceType", "title", "issuingBody", "documentRef")
SELECT gen_random_uuid()::text, sy.id, 'OFFICIAL_UNIVERSITY_DOCUMENT',
  'First Year Syllabus, Department of English, Four-Year B.A. (Honors) Program, effective from the session 2024-2025',
  'National University, Bangladesh',
  'academic-content/syllabus/national-university/2024-2025/english-honours/honours-1st-year/english-honours-first-year-syllabus-2024-25.pdf (sha256 2f4a8912863de132863ec5194fdc6f9eca3da63ad0800b244d8079597d9f50a3)'
FROM "Syllabus" sy
JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
JOIN "AcademicProgram" p ON p.id = sy."academicProgramId" AND p.code = 'english-honours'
JOIN "AcademicLevel" l ON l.id = sy."academicLevelId" AND l.code = 'HONOURS_1'
WHERE sy."versionLabel" = '2024-2025'
  AND NOT EXISTS (
    SELECT 1 FROM "SyllabusSource" x
    WHERE x."syllabusId" = sy.id AND x."sourceType" = 'OFFICIAL_UNIVERSITY_DOCUMENT'
  );

INSERT INTO "Course" (
  "id", "syllabusId", "code", "titleEn", "titleBn", "credits", "marks", "classHours", "sequence",
  "publicationStatus", "updatedAt"
)
SELECT gen_random_uuid()::text, sy.id, v.code, v.title, v.title_bn, v.credits, v.marks, v.class_hours,
  v.sequence, 'PUBLISHED', now()
FROM (VALUES
    ('211101', 'English Reading Skills', NULL, 4, 100, 60, 1),
    ('211103', 'English Writing Skills', NULL, 4, 100, 60, 2),
    ('211105', 'Introduction to Poetry', NULL, 4, 100, 60, 3),
    ('211107', 'Introduction to Prose: Fiction and Non-Fiction', NULL, 4, 100, 60, 4),
    ('211009', 'Bangla Language and Literature', 'বাংলা ভাষা ও সাহিত্য', 4, 100, 60, 5),
    ('212009', 'Introducing Sociology', NULL, 4, 100, 60, 6),
    ('211909', 'Introduction to Political Science', NULL, 4, 100, NULL, 7),
    ('219901', 'History of Bangladesh: Language, Culture and Identity', NULL, 4, 100, 60, 8),
    ('219903', 'Information and Communication Technology', NULL, 3, 75, NULL, 9),
    ('219904', 'Lab: Information and Communication Technology', NULL, 1, 25, NULL, 10)
) AS v(code, title, title_bn, credits, marks, class_hours, sequence)
JOIN "University" u ON u.code = 'nu'
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-honours'
JOIN "AcademicLevel" l ON l.code = 'HONOURS_1'
JOIN "Syllabus" sy ON sy."universityId" = u.id
  AND sy."academicProgramId" = p.id
  AND sy."academicLevelId" = l.id
  AND sy."versionLabel" = '2024-2025'
ON CONFLICT ("syllabusId", "code") DO UPDATE SET
  "titleEn" = EXCLUDED."titleEn",
  "titleBn" = EXCLUDED."titleBn",
  "credits" = EXCLUDED."credits",
  "marks" = EXCLUDED."marks",
  "classHours" = EXCLUDED."classHours",
  "sequence" = EXCLUDED."sequence",
  "publicationStatus" = 'PUBLISHED',
  "updatedAt" = now();

-- Old unofficial rows that are not in the official document keep their DRAFT status but move after
-- the official courses so they can never interleave with them.
UPDATE "Course" c
SET "sequence" = c."sequence" + 100, "updatedAt" = now()
FROM "Syllabus" sy, "University" u, "AcademicProgram" p, "AcademicLevel" l
WHERE c."syllabusId" = sy.id
  AND u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-honours'
  AND l.id = sy."academicLevelId" AND l.code = 'HONOURS_1'
  AND sy."versionLabel" = '2024-2025'
  AND c."publicationStatus" = 'DRAFT'
  AND c."sequence" < 100
  AND c.code NOT IN ('211101','211103','211105','211107','211009','212009','211909','219901','219903','219904');

INSERT INTO "Book" (
  "id", "courseId", "titleEn", "author", "publisher", "edition", "publicationYear", "sequence",
  "publicationStatus", "updatedAt"
)
SELECT gen_random_uuid()::text, c.id, v.title, v.author, v.publisher, v.edition, v.year, v.sequence,
  'PUBLISHED', now()
FROM (VALUES
    ('211101', 'Advance Reading Skills', 'Barr, P., Clegg, J., & Wallace, C.', 'Longman', NULL, 1981, 1),
    ('211101', 'Effective Reading', 'Greenall, S., & Swan, M.', 'Cambridge University Press', NULL, 1986, 2),
    ('211101', 'Practical Faster Reading', 'Mosback, G., & Mosback, V.', 'Cambridge University Press', NULL, 2010, 3),
    ('211101', 'Reading', 'Wallace', 'Oxford University Press', NULL, 1992, 4),
    ('211101', 'Class Readers', 'Walter, C.', 'Oxford University Press', NULL, 1988, 5),
    ('211101', 'Reading in the Language Classroom', 'Williams, E.', 'Macmillan', NULL, 1984, 6),
    ('211103', 'Writing Skills Handbook', 'Bazerman, C., & Wiener, H. S.', 'Houghton Mifflin', '4th ed.', 1998, 7),
    ('211103', 'A Sequence for Academic Writing', 'Behrens, L., Rosen, L. J.', 'Pearson', '7th ed.', 2017, 8),
    ('211103', 'Academic Writing', 'Bailey, S.', 'Routledge', '4th ed.', 2015, 9),
    ('211103', 'A Glossary of Literary Terms and Literary Theory', 'Cuddon, J. A.', 'Blackwell', NULL, 2013, 10),
    ('211103', 'Academic Writing from Paragraph to Essay', 'Zemach, D. E., Rumisek, L. A.', 'Macmillan', NULL, 2010, 11),
    ('211105', 'A Glossary of Literary Terms', 'Abrams, M. H., & Harpham, G. G.', 'Cengage Learning', '11th ed.', 2015, 12),
    ('211105', 'An Introduction to Literature: Fiction, Poetry, and Drama', 'Barnet, S.', 'Pearson Longman', NULL, 2008, 13),
    ('211105', 'Reading Visual Poetry', 'Bohn, W.', 'Fairleigh University Press', NULL, 2011, 14),
    ('211105', 'How to Read a Poem', 'Eagleton, T.', 'Blackwell', NULL, 2007, 15),
    ('211105', 'The Art of Poetry: How to Read a Poem', 'Wolosky, S.', 'Oxford University Press', NULL, 2001, 16),
    ('211105', 'The Poetry Handbook', 'Lennard, J.', 'Oxford University Press', '2nd ed.', 2006, 17),
    ('211107', 'An Introduction to Literature: Fiction, Poetry, and Drama', 'Barnet, S.', 'Pearson Longman', NULL, 2008, 18),
    ('211107', 'The Oxford Handbook of English Prose (1500-1640)', 'Hadfield, A. (Ed.)', 'Oxford University Press', NULL, 2013, 19),
    ('211107', 'Literature: An Introduction to Fiction, Poetry, and Drama', 'Kennedy, X. J., & Gioia, D.', 'Harper Collins', NULL, 1995, 20),
    ('211107', 'The Art of Fiction', 'Lodge, D.', 'Random House', NULL, 2012, 21),
    ('211107', 'R. K. Narayan: A Critical Appreciation', 'Sen, K.', 'University of Chicago Press', NULL, 1982, 22),
    ('212009', 'Sociology', 'Giddens, A.', 'The Polity Press', '6th ed.', 2009, 23),
    ('212009', 'An Introduction to Sociology', 'Goldthorpe, J. E.', 'Cambridge University Press', '3rd ed.', 1985, 24),
    ('212009', 'Sociology: Themes and Perspectives', 'Haralambos, M., & Holborn, M.', 'Harper Collins', NULL, 2013, 25),
    ('212009', 'Introduction to Sociology', 'Ritzer, G., & Murphy, W. W.', 'SAGE Publications', NULL, 2019, 26),
    ('212009', 'Sociology: A Brief Introduction', 'Schaefer, R. T.', 'McGraw-Hill', '10th ed.', 2012, 27),
    ('212009', 'The Basics of Sociology', 'Stolley, K. S.', 'Greenwood Press', '1st ed.', 2005, 28),
    ('212009', 'Classical Sociology', 'Turner, B. S.', 'Sage Publication', '9th ed.', 1999, 29),
    ('211909', 'Modern Politics & Government', 'Ball, A. R. & Peters, B. G.', 'Seven Bridges Press', NULL, 2000, 30),
    ('211909', 'Constitutional Law of Bangladesh', 'Islam, M.', 'BILIA, Dhaka', NULL, 2005, 31),
    ('211909', 'Political Organizations', 'Wilson, J. Q.', 'Princeton University Press', NULL, 1995, 32),
    ('211909', 'Political Institutions', 'Josep M. C.', 'Oxford University Press', NULL, 2003, 33),
    ('211909', 'A Grammar of Politics', 'Laski, H. J.', 'Harper Collins Publishers Ltd.', '5th ed.', 1967, 34),
    ('211909', 'Democracy in Plural Societies: A Comparative Exploration', 'Lijphart, A.', 'Yale University Press', NULL, 1977, 35),
    ('211909', 'Thinking about Democracy: Power Sharing and Majority Rule in Theory and Practice', 'Lijphart, A.', 'Routledge', NULL, 2008, 36),
    ('211909', 'Rediscovering Institutions: The Organizational Basis of Politics', 'March, J. G. & Olsen, J. P.', 'Free Press', NULL, 1989, 37),
    ('219901', 'Bangladesh: The Constitutional Quest for Autonomy', 'Ahmed, M.', 'University Press Limited', NULL, 1979, 38),
    ('219901', 'The Bengal Muslims 1871-1906: A Quest for Identity', 'Ahmed, R.', 'Oxford University Press', NULL, 1981, 39),
    ('219901', 'Travels in the Mogul Empire: A.D. 1656-1668', 'Bernier, F.', 'Atlantic Publishers', NULL, 2023, 40),
    ('219901', 'Tribal Peoples, Nationalism, and the Human Rights Challenge: The Adivasis of Bangladesh', 'Bleie, T.', 'University Press Limited', NULL, 2005, 41),
    ('219901', 'Dead Reckoning: Memories of the 1971 Bangladesh War', 'Bosc, S.', 'Hurst & Company', NULL, 2011, 42),
    ('219901', 'The Rise of Islam and the Bengal Frontier, 1204-1760', 'Eaton, R. M.', 'University of California Press', NULL, 1996, 43),
    ('219901', 'The British in India: Three Centuries of Ambition and Experience', 'Gilmour, D.', 'Penguin', NULL, 2019, 44),
    ('219901', 'Cambridge Economic History of India', 'Habib, L.', 'Cambridge University Press', NULL, 1982, 45),
    ('219901', 'Society and Sociology in Bangladesh: A South Asian Perspective', 'Halim, S., Amanullah, A. S. M., & Nasir, R. I. (Eds.)', 'The University Press Limited', NULL, 2024, 46),
    ('219901', 'Fifty Years of Bangladesh, 1971-2021: Crises of Culture, Development, Governance and Identity', 'Hashmi, T.', 'Palgrave Macmillan', NULL, 2021, 47),
    ('219901', 'History of Sufism in Bengal', 'Huq, M. E.', 'Bangladesh Asiatic Society', NULL, 1975, 48),
    ('219901', 'Karl Marx on India', 'Husain, I.', 'Tulika Books', NULL, 2014, 49),
    ('219901', 'Pakistan: Failure in National Integration', 'Jahan, R.', 'Columbia University Press', NULL, 1972, 50),
    ('219901', 'The Bangladesh Revolution and Its Aftermath', 'Maniruzzaman, T.', 'University Press Limited', '2nd ed.', 1988, 51),
    ('219901', 'Bangladesh: A Legacy of Blood', 'Mascarenhas, A.', 'Hodder and Stoughton', NULL, 1986, 52),
    ('219901', 'The Foreshadowing of Bangladesh: Bengal Muslim League and Muslim Politics', 'Rashid, H. O.', 'University Press Limited', '3rd ed.', 2015, 53),
    ('219901', 'The Islamic Syncretistic Tradition in Bengal', 'Roy, A.', 'Princeton University Press', NULL, 1984, 54),
    ('219901', 'Identity and Violence: The Illusion of Destiny', 'Sen, A.', 'W. W. Norton & Company', NULL, 2006, 55),
    ('219901', 'The Emergency of Bangladesh: A History of East Pakistan', 'Umar, B.', 'Bangla Gobeshona', NULL, 2022, 56),
    ('219903', 'Introduction to Computers', 'Norton, P.', 'The McGraw-Hill', '9th ed.', 2008, 57),
    ('219903', 'The Internet Book: Everything You Need to Know about Computer Networking and How the Internet Works', 'Comer, D. E.', 'Chapman and Hall/CRC Press', '5th ed.', 2018, 58),
    ('219903', 'Microsoft Office 2016 Step by Step', 'Lambert, J., & Frye, C.', 'Microsoft Press', NULL, 2015, 59),
    ('219903', 'Digital Privacy and Security Using Windows: A Practical Guide', 'Hassan, N. A., & Hijazi, R.', 'Apress', NULL, 2017, 60),
    ('219903', 'Data Analytics Made Accessible', 'Maheshwari, A.', 'Jay Cobb', NULL, 2024, 61),
    ('219903', 'Artificial Intelligence: A Modern Approach', 'Russell, S. J., & Norvig, P.', 'Pearson', '4th ed.', 2020, 62),
    ('219903', 'Introduction to Machine Learning', 'Alpaydin, E.', 'MIT Press', '4th ed.', 2020, 63),
    ('219904', 'The Internet Book: Everything You Need to Know about Computer Networking and How the Internet Works', 'Comer, D. E.', 'Chapman and Hall/CRC Press', '5th ed.', 2018, 64),
    ('219904', 'Microsoft Office 2016 Step by Step', 'Lambert, J., & Frye, C.', 'Microsoft Press', NULL, 2015, 65)
) AS v(course_code, title, author, publisher, edition, year, sequence)
JOIN "University" u ON u.code = 'nu'
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-honours'
JOIN "AcademicLevel" l ON l.code = 'HONOURS_1'
JOIN "Syllabus" sy ON sy."universityId" = u.id
  AND sy."academicProgramId" = p.id
  AND sy."academicLevelId" = l.id
  AND sy."versionLabel" = '2024-2025'
JOIN "Course" c ON c."syllabusId" = sy.id AND c.code = v.course_code
WHERE NOT EXISTS (
  SELECT 1 FROM "Book" b
  WHERE b."courseId" = c.id AND b."titleEn" = v.title AND b.author IS NOT DISTINCT FROM v.author
);
