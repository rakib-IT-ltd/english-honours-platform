-- Current syllabus version flag.

-- AlterTable
ALTER TABLE "Syllabus" ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT false;

-- Manual addition (Prisma cannot express partial indexes and ignores them when diffing):
-- at most one current version per program + level + session.
CREATE UNIQUE INDEX "Syllabus_one_current_per_program_level_session"
  ON "Syllabus" ("academicProgramId", "academicLevelId", "academicSessionId")
  WHERE "isCurrent";
