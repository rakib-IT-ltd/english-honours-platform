-- Spelling corrections approved by the owner on 2026-11-25 for already-loaded rows (see the header of
-- nu-english-masters-2013-2014.sql). Runs BEFORE that file so it never creates duplicates; on a fresh
-- database it changes nothing. Safe to run repeatedly.

UPDATE "Book" b
SET "titleEn" = '''The Nun''s Priest''s Tale''', "updatedAt" = now()
FROM "Course" c
WHERE b."courseId" = c.id AND c.code = '311101'
  AND b."titleEn" = '''The Nuns Priests Tale''';

UPDATE "Book" b
SET "titleEn" = 'Troilus and Criseyde', "updatedAt" = now()
FROM "Course" c
WHERE b."courseId" = c.id AND c.code = '311101' AND b."titleEn" = 'Troilus and Cresyde';

UPDATE "Book" b
SET "author" = 'Seamus Heaney', "updatedAt" = now()
FROM "Course" c
WHERE b."courseId" = c.id AND c.code = '311105' AND b."author" = 'Seamus Heany';

UPDATE "Book" b
SET "author" = 'Eugene O''Neill', "updatedAt" = now()
FROM "Course" c
WHERE b."courseId" = c.id AND c.code = '311107' AND b."author" = 'Eugene O'' Neil';

UPDATE "Book" b
SET "author" = 'Tennessee Williams', "updatedAt" = now()
FROM "Course" c
WHERE b."courseId" = c.id AND c.code = '311107' AND b."author" = 'Tennessee William';
