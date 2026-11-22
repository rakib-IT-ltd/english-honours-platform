-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED');

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "yearNumber" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusSource" (
    "id" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "documentRef" TEXT NOT NULL,
    "publishedOn" DATE,
    "sha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusVerification" (
    "id" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "note" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_code_key" ON "University"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_universityId_code_key" ON "Department"("universityId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_departmentId_yearNumber_key" ON "AcademicYear"("departmentId", "yearNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_universityId_label_key" ON "AcademicSession"("universityId", "label");

-- CreateIndex
CREATE INDEX "Syllabus_academicYearId_idx" ON "Syllabus"("academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_academicSessionId_academicYearId_versionLabel_key" ON "Syllabus"("academicSessionId", "academicYearId", "versionLabel");

-- CreateIndex
CREATE INDEX "SyllabusSource_syllabusId_idx" ON "SyllabusSource"("syllabusId");

-- CreateIndex
CREATE INDEX "SyllabusVerification_syllabusId_idx" ON "SyllabusVerification"("syllabusId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicSession" ADD CONSTRAINT "AcademicSession_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusSource" ADD CONSTRAINT "SyllabusSource_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusVerification" ADD CONSTRAINT "SyllabusVerification_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Manual additions (CHECK constraints are not expressible in schema.prisma; Prisma ignores them
-- when comparing the schema with the database).
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_yearNumber_check" CHECK ("yearNumber" BETWEEN 1 AND 4);
ALTER TABLE "AcademicSession" ADD CONSTRAINT "AcademicSession_years_check" CHECK ("endYear" >= "startYear");
