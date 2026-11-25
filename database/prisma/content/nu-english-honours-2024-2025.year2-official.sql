-- NU English Honours, Second Year, session 2024-2025: courses, credits, marks, class hours and the
-- "List of Books" of each detailed course, taken from the OFFICIAL NU document.
--
-- SOURCE (official): "National University, Bangladesh - Syllabus, Bachelor of Arts (Honors) Second
-- Year, Department of English, Effective from the Session: 2024-2025 and onwards" (33 pages, file
-- name Second-Year-Syllabus_English_Session-2024_2025.pdf), supplied by the project owner on
-- 2026-11-25. The original is kept in
-- academic-content/syllabus/national-university/2024-2025/english-honours/honours-2nd-year/
-- (SHA-256 dba7149845c5356871452dda6f94b889ce1e20e01188561d2d49cd4205cb6411).
--
-- STATUS: loaded UNVERIFIED with the official document attached; verification is recorded by
-- nu-english-honours-2024-2025.zz-verification.sql (owner's instruction of 2026-11-25).
--
-- Runs after the unofficial-list files (file-name order). Old rows with other codes stay DRAFT.
--
-- Notes on the document:
--  * The table lists 10 papers, 850 marks / 34 credits (core 4 papers, allied 2 papers, Functional
--    English, Applied ICT, ICT practical, viva-voce). Detailed pages (class hours 56, book lists)
--    exist only for the 4 core papers and the 2 allied papers; Functional English, Applied ICT and
--    its practical have credits and marks only here, and the viva has marks/credits plus guidelines.
--  * The Social Work Practice and Economy of Bangladesh lists also contain Bangla books whose text
--    in the PDF is damaged by font conversion; those Bangla books are NOT loaded (English ones are).
--  * Wording of titles and authors follows the document (APA style); a few books have no publisher
--    or year printed, or say "Latest edition"/"n.d."/"Current issue" - then the year stays empty
--    and a note is kept in the description. Editors/translators are in the description.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Syllabus" sy
    JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
    JOIN "AcademicProgram" p ON p.id = sy."academicProgramId" AND p.code = 'english-honours'
    JOIN "AcademicLevel" l ON l.id = sy."academicLevelId" AND l.code = 'HONOURS_2'
    WHERE sy."versionLabel" = '2024-2025'
  ) THEN
    RAISE EXCEPTION 'NU English Honours 2nd Year 2024-2025 syllabus row does not exist yet';
  END IF;
END $$;

UPDATE "Syllabus" sy
SET "notes" = 'Official NU Second Year syllabus (Department of English, B.A. Honors), effective from session 2024-2025 and onwards. Transcribed from the original document. Applies to session 2024-2025 onwards as stated in the document.',
    "isCurrent" = true,
    "updatedAt" = now()
FROM "University" u, "AcademicProgram" p, "AcademicLevel" l
WHERE u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-honours'
  AND l.id = sy."academicLevelId" AND l.code = 'HONOURS_2'
  AND sy."versionLabel" = '2024-2025';

INSERT INTO "SyllabusSource" ("id", "syllabusId", "sourceType", "title", "issuingBody", "documentRef")
SELECT gen_random_uuid()::text, sy.id, 'OFFICIAL_UNIVERSITY_DOCUMENT',
  'Syllabus, Bachelor of Arts (Honors) Second Year, Department of English, effective from the session 2024-2025 and onwards',
  'National University, Bangladesh',
  'academic-content/syllabus/national-university/2024-2025/english-honours/honours-2nd-year/english-honours-second-year-syllabus-2024-25.pdf (sha256 dba7149845c5356871452dda6f94b889ce1e20e01188561d2d49cd4205cb6411)'
FROM "Syllabus" sy
JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
JOIN "AcademicProgram" p ON p.id = sy."academicProgramId" AND p.code = 'english-honours'
JOIN "AcademicLevel" l ON l.id = sy."academicLevelId" AND l.code = 'HONOURS_2'
WHERE sy."versionLabel" = '2024-2025'
  AND NOT EXISTS (
    SELECT 1 FROM "SyllabusSource" x
    WHERE x."syllabusId" = sy.id AND x."sourceType" = 'OFFICIAL_UNIVERSITY_DOCUMENT'
  );

INSERT INTO "Course" (
  "id", "syllabusId", "code", "titleEn", "credits", "marks", "classHours", "sequence",
  "publicationStatus", "updatedAt"
)
SELECT gen_random_uuid()::text, sy.id, v.code, v.title, v.credits, v.marks, v.class_hours,
  v.sequence, 'PUBLISHED', now()
FROM (VALUES
    ('8221151', 'Introduction to Drama', 4, 100, 56, 1),
    ('8221153', 'Romantic Poetry', 4, 100, 56, 2),
    ('8221155', 'History of English Literature', 4, 100, 56, 3),
    ('8221157', 'Postcolonial Literature', 4, 100, 56, 4),
    ('8222159', 'Social Work Practice', 4, 100, 56, 5),
    ('8222259', 'Economy of Bangladesh', 4, 100, 56, 6),
    ('8221171', 'Functional English', 4, 100, NULL, 7),
    ('8226601', 'Applied Information and Communication Technology (Applied ICT)', 3, 75, NULL, 8),
    ('8226602', 'Practical: Applied ICT', 1, 25, NULL, 9),
    ('8221162', 'Viva-voce (English)', 2, 50, NULL, 10)
) AS v(code, title, credits, marks, class_hours, sequence)
JOIN "University" u ON u.code = 'nu'
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-honours'
JOIN "AcademicLevel" l ON l.code = 'HONOURS_2'
JOIN "Syllabus" sy ON sy."universityId" = u.id
  AND sy."academicProgramId" = p.id
  AND sy."academicLevelId" = l.id
  AND sy."versionLabel" = '2024-2025'
ON CONFLICT ("syllabusId", "code") DO UPDATE SET
  "titleEn" = EXCLUDED."titleEn",
  "credits" = EXCLUDED."credits",
  "marks" = EXCLUDED."marks",
  "classHours" = EXCLUDED."classHours",
  "sequence" = EXCLUDED."sequence",
  "publicationStatus" = 'PUBLISHED',
  "updatedAt" = now();

-- Old unofficial rows (other codes) stay DRAFT, moved after the official courses.
UPDATE "Course" c
SET "sequence" = c."sequence" + 100, "updatedAt" = now()
FROM "Syllabus" sy, "University" u, "AcademicProgram" p, "AcademicLevel" l
WHERE c."syllabusId" = sy.id
  AND u.id = sy."universityId" AND u.code = 'nu'
  AND p.id = sy."academicProgramId" AND p.code = 'english-honours'
  AND l.id = sy."academicLevelId" AND l.code = 'HONOURS_2'
  AND sy."versionLabel" = '2024-2025'
  AND c."publicationStatus" = 'DRAFT'
  AND c."sequence" < 100
  AND c.code NOT IN ('8221151','8221153','8221155','8221157','8222159','8222259','8221171','8226601','8226602','8221162');

INSERT INTO "Book" (
  "id", "courseId", "titleEn", "author", "publisher", "edition", "publicationYear", "description",
  "sequence", "publicationStatus", "updatedAt"
)
SELECT gen_random_uuid()::text, c.id, v.title, v.author, v.publisher, v.edition, v.year,
  v.description, v.sequence, 'PUBLISHED', now()
FROM (VALUES
    ('8221151', 'A Glossary of Literary Terms', 'Abrams, M. H., & Harpham, G. G.', 'Cengage Learning', '11th ed.', 2015, NULL, 1),
    ('8221151', 'Poetics', 'Aristotle', 'Penguin Books', NULL, 1996, 'M. Heath, Trans.', 2),
    ('8221151', 'History of the Theatre', 'Brockett, O. G., & Hildy, F. J.', 'Pearson', '10th ed.', 2013, NULL, 3),
    ('8221151', 'The Oxford Illustrated History of Theatre', 'Brown, J. R. (Ed.)', 'Oxford University Press', NULL, 1995, NULL, 4),
    ('8221151', 'Reading Greek Tragedy', 'Goldhill, S.', 'Cambridge University Press', NULL, 1986, NULL, 5),
    ('8221151', 'Dictionary of the Theatre: Terms, Concepts, and Analysis', 'Pavis, P.', 'University of Toronto Press', NULL, 1998, 'C. Shantz, Trans.', 6),
    ('8221151', 'As You Like It', 'Shakespeare, W.', 'Oxford University Press', NULL, 2008, 'A. Brissenden, Ed.', 7),
    ('8221151', 'Plays Pleasant', 'Shaw, G. B.', 'Penguin Books', NULL, 2003, NULL, 8),
    ('8221151', 'The Lion and the Jewel', 'Soyinka, W.', 'Oxford University Press', NULL, 1963, NULL, 9),
    ('8221151', 'The Elements of Drama', 'Styan, J. L.', 'Cambridge University Press', NULL, 1960, NULL, 10),
    ('8221153', 'The Mirror and the Lamp: Romantic Theory and the Critical Tradition', 'Abrams, M. H.', 'Oxford University Press', NULL, 1971, NULL, 11),
    ('8221153', 'Songs of Innocence and of Experience', 'Blake, W.', 'Oxford University Press', NULL, 2008, 'R. N. Essick, Ed.', 12),
    ('8221153', 'Don Juan', 'Byron, G. G.', 'Penguin Classics', NULL, 2008, NULL, 13),
    ('8221153', 'The Rime of the Ancient Mariner and Other Poems', 'Coleridge, S. T.', 'Dover Publications', NULL, 2005, NULL, 14),
    ('8221153', 'Romantic Poetry: An Analytical Study', 'Rahman, A.', 'Khan Brothers & Company', NULL, 2012, NULL, 15),
    ('8221153', 'Romanticism: An Oxford Guide', 'Roe, N. (Ed.)', 'Oxford University Press', NULL, 2005, NULL, 16),
    ('8221153', 'Shelley''s Poetry and Prose', 'Shelley, P. B.', 'W. W. Norton & Company', '2nd ed.', 2006, 'D. H. Reiman & N. Fraistat, Eds.', 17),
    ('8221153', 'Selected Poems', 'Wordsworth, W.', 'Penguin Classics', NULL, 2008, 'S. Gill, Ed.', 18),
    ('8221155', 'The Norton Anthology of English Literature', 'Abrams, M. H., & Greenblatt, S. (Eds.)', 'W. W. Norton & Company', '11th ed.', 2018, NULL, 19),
    ('8221155', 'A Short History of English Literature', 'Barnard, R.', 'Blackwell Publishing', '3rd ed.', 2003, NULL, 20),
    ('8221155', 'The Routledge History of Literature in English: Britain and Ireland', 'Carter, R., & McRae, J.', 'Routledge', '3rd ed.', 2016, NULL, 21),
    ('8221155', 'A Critical History of English Literature (Vols. 1-4)', 'Daiches, D.', 'Mandarin', NULL, 1994, NULL, 22),
    ('8221155', 'The New Pelican Guide to English Literature (Vols. 1-9)', 'Ford, B. (Ed.)', 'Penguin Books', NULL, NULL, 'Printed year range: 1974-1978', 23),
    ('8221155', 'Engraji Shahityer Itihash', 'Hussain, S. S.', 'Friend''s Book Corner', NULL, 1984, NULL, 24),
    ('8221155', 'English Literature: Its History and Its Significance for the Life of the English-Speaking World', 'Long, W. J.', 'Maple Press', NULL, 2006, 'Original work published 1909', 25),
    ('8221155', 'A Brief History of English Literature', 'Peck, J., & Coyle, M.', 'Palgrave Macmillan', '2nd ed.', 2012, NULL, 26),
    ('8221155', 'The Concise Cambridge History of English Literature', 'Sampson, G.', 'Cambridge University Press', '3rd ed.', 1970, NULL, 27),
    ('8221155', 'The Short Oxford History of English Literature', 'Sanders, A.', 'Oxford University Press', '3rd ed.', 2004, NULL, 28),
    ('8221157', 'The Empire Writes Back: Theory and Practice in Post-colonial Literatures', 'Ashcroft, B., Griffiths, G., & Tiffin, H.', 'Routledge', NULL, 1989, NULL, 29),
    ('8221157', 'The Post-colonial Studies Reader', 'Ashcroft, B., Griffiths, G., & Tiffin, H. (Eds.)', 'Routledge', NULL, 1995, NULL, 30),
    ('8221157', 'Post-colonial Studies: The Key Concepts', 'Ashcroft, B., Griffiths, G., & Tiffin, H.', 'Routledge', '3rd ed.', 2013, NULL, 31),
    ('8221157', 'An Introduction to Post-colonial Theory', 'Childs, P., & Williams, P.', 'Longman', NULL, 1997, NULL, 32),
    ('8221157', 'The Shadow Lines', 'Ghosh, A.', 'Ravi Dayal/Penguin Books India', NULL, 2005, NULL, 33),
    ('8221157', 'Post-colonial Drama: Theory, Practice, Politics', 'Gilbert, H., & Tompkins, J.', NULL, NULL, 1996, NULL, 34),
    ('8221157', 'New National and Post-colonial Literatures: An Introduction', 'King, B. (Ed.)', 'Clarendon Press', NULL, 1998, NULL, 35),
    ('8221157', 'Colonialism/Postcolonialism', 'Loomba, A.', 'Routledge', '3rd ed.', 2015, NULL, 36),
    ('8221157', 'Postcolonial Literature: An Introduction', 'Nayar, P. K.', 'Pearson Longman', NULL, 2008, NULL, 37),
    ('8221157', 'Decolonising the Mind: The Politics of Language in African Literature', 'Ngũgĩ wa Thiong’o', 'James Currey', NULL, 1986, NULL, 38),
    ('8221157', 'The Road', 'Soyinka, W.', 'Oxford University Press', NULL, 1965, NULL, 39),
    ('8221157', 'Post-colonial Studies: The Essential Glossary', 'Thieme, J.', NULL, NULL, 2003, NULL, 40),
    ('8221157', 'Collected Poems: 1948-1984', 'Walcott, D.', 'Faber & Faber', NULL, 1986, NULL, 41),
    ('8222159', 'The Social Work Dictionary', 'Barker, R. L.', 'NASW Press, Washington, DC', NULL, 1995, NULL, 42),
    ('8222159', 'Green Social Work: From Environmental Crises to Environmental Justice', 'Dominelli, L.', 'Polity Press', NULL, 2012, NULL, 43),
    ('8222159', 'An Introduction to Social Welfare', 'Friedlander, W. A.', 'Prentice Hall, New York', NULL, 1977, NULL, 44),
    ('8222159', 'Introduction to Social Work Methods', 'Houssian, M. N. & Alauddin, M.', 'Anwari Publication, Dhaka, Bangladesh', NULL, 1990, NULL, 45),
    ('8222159', 'Social Work: A Profession of Many Faces', 'Morales, A. & Sheafor, B. W.', 'Allyn and Bacon, Boston, USA', NULL, 1977, NULL, 46),
    ('8222159', 'Introduction to Social Work', 'Skidmore, R. A. & others', 'Prentice Hall, New Jersey, USA', NULL, 1993, NULL, 47),
    ('8222259', 'Annual Report', 'Bangladesh Bank', 'Bangladesh Bank, Dhaka, Bangladesh', NULL, NULL, 'Printed as "Current issue"', 48),
    ('8222259', 'Making of a Nation, Bangladesh: An Economist''s Tale', 'Islam, Nurul', 'University Press Limited, Dhaka, Bangladesh', NULL, 2003, NULL, 49),
    ('8222259', 'Bangladesh Economy', 'Islam, S. M. Mujahidul', 'Bangladesh Publishers, Dhaka, Bangladesh', NULL, NULL, 'Printed as "Latest edition"', 50),
    ('8222259', 'Discovery of Bangladesh', 'Khan, Akbar Ali', 'University Press Limited, Dhaka, Bangladesh', NULL, 1996, NULL, 51),
    ('8222259', 'Bangladesh''s Development Experience: Some Selected Issues', 'Mahmud, Wahiduddin (Ed.)', 'University Press Limited, Dhaka, Bangladesh', NULL, NULL, 'Printed as "n.d." (no date)', 52),
    ('8222259', 'Bangladesh Economic Review', 'Ministry of Finance, Government of Bangladesh', 'Finance Division, Dhaka, Bangladesh', NULL, NULL, 'Printed as "Latest edition"', 53),
    ('8222259', 'Bangladesh Development Studies (Journal, current issues)', 'Sen, Binayak, & Ali, Zaidi (Eds.)', 'Bangladesh Institute of Development Studies (BIDS), Dhaka, Bangladesh', NULL, NULL, 'Printed as "n.d." (no date)', 54),
    ('8222259', 'Untranquil Recollections: Nation Building in Post-Liberation Bangladesh', 'Sobhan, Rehman', 'SAGE Publications, New Delhi, India', NULL, 2016, NULL, 55)
) AS v(course_code, title, author, publisher, edition, year, description, sequence)
JOIN "University" u ON u.code = 'nu'
JOIN "AcademicProgram" p ON p."universityId" = u.id AND p.code = 'english-honours'
JOIN "AcademicLevel" l ON l.code = 'HONOURS_2'
JOIN "Syllabus" sy ON sy."universityId" = u.id
  AND sy."academicProgramId" = p.id
  AND sy."academicLevelId" = l.id
  AND sy."versionLabel" = '2024-2025'
JOIN "Course" c ON c."syllabusId" = sy.id AND c.code = v.course_code
WHERE NOT EXISTS (
  SELECT 1 FROM "Book" b
  WHERE b."courseId" = c.id AND b."titleEn" = v.title AND b.author IS NOT DISTINCT FROM v.author
);
