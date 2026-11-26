-- DEVELOPMENT SAMPLE ONLY - NOT REAL ACADEMIC MATERIAL.
-- A placeholder book with placeholder study material so the study-centre screens can be tried in
-- the development Codespace. All text is obviously generic. Every section has isSample = true, and
-- the website shows a "Sample content" label on it. Loaded only by `pnpm db:load-sample`
-- (refused when NODE_ENV=production). Real material is loaded from database/prisma/content/ after
-- academic review. Safe to run repeatedly.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Course" c
    JOIN "Syllabus" sy ON sy.id = c."syllabusId"
    JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
    WHERE c.code = '311111' AND c."publicationStatus" = 'PUBLISHED'
  ) THEN
    RAISE EXCEPTION 'Load the NU Masters content first (pnpm db:load-content)';
  END IF;
END $$;

INSERT INTO "Book" ("id", "courseId", "titleEn", "titleBn", "author", "genre", "description", "sequence", "publicationStatus", "updatedAt")
SELECT 'sample-study-book', c.id, 'SAMPLE: Study Centre Test Book', 'নমুনা: স্টাডি সেন্টার পরীক্ষামূলক বই',
  'Sample Author', 'Sample / Not real',
  'Development sample for trying the study screens. This is not real academic material.',
  999, 'PUBLISHED', now()
FROM "Course" c
JOIN "Syllabus" sy ON sy.id = c."syllabusId"
JOIN "University" u ON u.id = sy."universityId" AND u.code = 'nu'
WHERE c.code = '311111' AND c."publicationStatus" = 'PUBLISHED'
ORDER BY sy."isCurrent" DESC
LIMIT 1
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "BookSection" ("id", "bookId", "sequence", "titleEn", "titleBn", "subtitleEn", "subtitleBn", "publicationStatus", "isSample", "updatedAt")
VALUES
  ('sample-section-1', 'sample-study-book', 1, 'Sample Section One', 'নমুনা অংশ এক', 'Placeholder introduction', 'নমুনা ভূমিকা', 'PUBLISHED', true, now()),
  ('sample-section-2', 'sample-study-book', 2, 'Sample Section Two', 'নমুনা অংশ দুই', 'Placeholder second part', 'নমুনা দ্বিতীয় অংশ', 'PUBLISHED', true, now()),
  ('sample-section-3', 'sample-study-book', 3, 'Sample Section Three', 'নমুনা অংশ তিন', 'Placeholder third part', 'নমুনা তৃতীয় অংশ', 'PUBLISHED', true, now())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "StudyItem" ("id", "sectionId", "kind", "sequence", "textEn", "textBn", "noteEn", "noteBn", "updatedAt")
VALUES
  ('sample-i-01', 'sample-section-1', 'ORIGINAL_TEXT', 1, 'Sample paragraph one. This is placeholder text, not a real extract.', NULL, NULL, NULL, now()),
  ('sample-i-02', 'sample-section-1', 'ORIGINAL_TEXT', 2, 'Sample paragraph two. Real original text will appear here after academic review.', NULL, NULL, NULL, now()),
  ('sample-i-03', 'sample-section-1', 'BANGLA_EXPLANATION', 1, NULL, 'এটি একটি নমুনা ব্যাখ্যা। প্রকৃত বাংলা ব্যাখ্যা পর্যালোচনার পর যুক্ত হবে।', NULL, NULL, now()),
  ('sample-i-04', 'sample-section-1', 'SUMMARY', 1, 'Sample summary. Placeholder only.', 'নমুনা সারসংক্ষেপ। শুধু পরীক্ষার জন্য।', NULL, NULL, now()),
  ('sample-i-05', 'sample-section-1', 'CENTRAL_IDEA', 1, 'Sample central idea one (placeholder).', 'নমুনা মূল ভাবনা (এক)।', NULL, NULL, now()),
  ('sample-i-06', 'sample-section-1', 'CENTRAL_IDEA', 2, 'Sample central idea two (placeholder).', 'নমুনা মূল ভাবনা (দুই)।', NULL, NULL, now()),
  ('sample-i-07', 'sample-section-1', 'CRITICAL_ANALYSIS', 1, 'Sample critical analysis. Placeholder only.', 'নমুনা সমালোচনামূলক বিশ্লেষণ।', NULL, NULL, now()),
  ('sample-i-08', 'sample-section-1', 'QUOTATION', 1, 'Sample quotation (placeholder).', NULL, 'Sample meaning of the quotation.', 'উদ্ধৃতির নমুনা অর্থ।', now()),
  ('sample-i-09', 'sample-section-1', 'QUESTION_ANSWER', 1, 'Sample question: what is this placeholder for?', NULL, 'Sample answer: to test the screens.', 'নমুনা উত্তর: পর্দা পরীক্ষার জন্য।', now()),
  ('sample-i-10', 'sample-section-1', 'VOCABULARY', 1, 'sample', 'নমুনা', 'an example used for testing', NULL, now()),
  ('sample-i-11', 'sample-section-1', 'VOCABULARY', 2, 'placeholder', 'স্থানধারক', 'text that stands in for real text', NULL, now()),
  ('sample-i-12', 'sample-section-2', 'ORIGINAL_TEXT', 1, 'Sample paragraph for section two (placeholder).', NULL, NULL, NULL, now()),
  ('sample-i-13', 'sample-section-2', 'BANGLA_EXPLANATION', 1, NULL, 'দ্বিতীয় অংশের নমুনা ব্যাখ্যা।', NULL, NULL, now()),
  ('sample-i-14', 'sample-section-2', 'SUMMARY', 1, 'Sample summary for section two.', NULL, NULL, NULL, now()),
  ('sample-i-15', 'sample-section-3', 'ORIGINAL_TEXT', 1, 'Sample paragraph for section three (placeholder).', NULL, NULL, NULL, now())
ON CONFLICT ("id") DO NOTHING;
