-- Rename the fifth shared level to "Masters Final" as decided by the project owner.
-- Reference data only; no foreign keys use the code.
UPDATE "AcademicLevel"
SET "code" = 'MASTERS_FINAL', "nameEn" = 'Masters Final', "nameBn" = 'মাস্টার্স ফাইনাল', "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'MASTERS_1';
