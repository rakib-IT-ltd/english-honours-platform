-- Multi-university academic structure.
-- Replaces the per-department AcademicYear with shared AcademicLevel rows, and adds
-- AcademicProgram / ProgramLevel. Syllabus is re-linked to program + level + session.
-- The previous migration is left untouched (applied migrations are never edited).

-- Guard: this restructuring does not migrate data. Only run it while no syllabus/year rows exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Syllabus") OR EXISTS (SELECT 1 FROM "AcademicYear") THEN
    RAISE EXCEPTION 'multi_university_levels: "Syllabus" or "AcademicYear" is not empty; migrate this data manually first';
  END IF;
END $$;

-- DropForeignKey / DropTable (AcademicYear is replaced by the shared AcademicLevel)
ALTER TABLE "Syllabus" DROP CONSTRAINT "Syllabus_academicYearId_fkey";
DROP INDEX "Syllabus_academicYearId_idx";
DROP INDEX "Syllabus_academicSessionId_academicYearId_versionLabel_key";
ALTER TABLE "Syllabus" DROP COLUMN "academicYearId";
DROP TABLE "AcademicYear";

-- CreateEnum
CREATE TYPE "ProgrammeType" AS ENUM ('HONOURS', 'MASTERS');
CREATE TYPE "SyllabusSourceType" AS ENUM ('OFFICIAL_UNIVERSITY_DOCUMENT', 'OTHER');

-- AlterTable
ALTER TABLE "SyllabusSource" ADD COLUMN "sourceType" "SyllabusSourceType" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "AcademicLevel" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicProgram" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "programmeType" "ProgrammeType" NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramLevel" (
    "programId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,

    CONSTRAINT "ProgramLevel_pkey" PRIMARY KEY ("programId","levelId")
);

-- AlterTable (table is empty, guarded above)
ALTER TABLE "Syllabus" ADD COLUMN "universityId" TEXT NOT NULL,
ADD COLUMN "academicProgramId" TEXT NOT NULL,
ADD COLUMN "academicLevelId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AcademicLevel_code_key" ON "AcademicLevel"("code");
CREATE UNIQUE INDEX "AcademicLevel_sequence_key" ON "AcademicLevel"("sequence");
CREATE UNIQUE INDEX "Department_id_universityId_key" ON "Department"("id", "universityId");
CREATE UNIQUE INDEX "AcademicSession_id_universityId_key" ON "AcademicSession"("id", "universityId");
CREATE UNIQUE INDEX "AcademicProgram_universityId_code_key" ON "AcademicProgram"("universityId", "code");
CREATE UNIQUE INDEX "AcademicProgram_id_universityId_key" ON "AcademicProgram"("id", "universityId");
CREATE INDEX "AcademicProgram_departmentId_universityId_idx" ON "AcademicProgram"("departmentId", "universityId");
CREATE INDEX "ProgramLevel_levelId_idx" ON "ProgramLevel"("levelId");
CREATE INDEX "Syllabus_universityId_idx" ON "Syllabus"("universityId");
CREATE INDEX "Syllabus_academicSessionId_universityId_idx" ON "Syllabus"("academicSessionId", "universityId");
CREATE INDEX "Syllabus_academicProgramId_academicLevelId_idx" ON "Syllabus"("academicProgramId", "academicLevelId");
CREATE UNIQUE INDEX "Syllabus_program_level_session_version_key" ON "Syllabus"("academicProgramId", "academicLevelId", "academicSessionId", "versionLabel");

-- AddForeignKey
ALTER TABLE "AcademicProgram" ADD CONSTRAINT "AcademicProgram_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AcademicProgram" ADD CONSTRAINT "AcademicProgram_departmentId_universityId_fkey" FOREIGN KEY ("departmentId", "universityId") REFERENCES "Department"("id", "universityId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramLevel" ADD CONSTRAINT "ProgramLevel_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AcademicProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramLevel" ADD CONSTRAINT "ProgramLevel_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_academicProgramId_universityId_fkey" FOREIGN KEY ("academicProgramId", "universityId") REFERENCES "AcademicProgram"("id", "universityId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_academicSessionId_universityId_fkey" FOREIGN KEY ("academicSessionId", "universityId") REFERENCES "AcademicSession"("id", "universityId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_academicProgramId_academicLevelId_fkey" FOREIGN KEY ("academicProgramId", "academicLevelId") REFERENCES "ProgramLevel"("programId", "levelId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The old single-column session FK is superseded by the composite one.
ALTER TABLE "Syllabus" DROP CONSTRAINT "Syllabus_academicSessionId_fkey";

-- Manual additions (CHECK constraints; Prisma ignores them when diffing).
ALTER TABLE "University" ADD CONSTRAINT "University_code_check" CHECK ("code" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE "AcademicLevel" ADD CONSTRAINT "AcademicLevel_sequence_check" CHECK ("sequence" >= 1);

-- Shared platform levels (reference data, not syllabus content). Bangla names as supplied by the
-- project owner; still pending academic review.
INSERT INTO "AcademicLevel" ("id", "code", "sequence", "nameEn", "nameBn", "updatedAt") VALUES
  ('00000000-0000-4000-8000-000000000001', 'HONOURS_1', 1, 'Honours 1st Year', 'অনার্স ১ম বর্ষ', CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000002', 'HONOURS_2', 2, 'Honours 2nd Year', 'অনার্স ২য় বর্ষ', CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000003', 'HONOURS_3', 3, 'Honours 3rd Year', 'অনার্স ৩য় বর্ষ', CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000004', 'HONOURS_4', 4, 'Honours 4th Year', 'অনার্স ৪র্থ বর্ষ', CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000005', 'MASTERS_1', 5, 'Masters 1st Year', 'মাস্টার্স ফাইনাল', CURRENT_TIMESTAMP);
