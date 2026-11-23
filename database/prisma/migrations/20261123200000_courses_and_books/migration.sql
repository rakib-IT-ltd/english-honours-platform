-- Courses (per syllabus version) and books (per course), with the publication workflow status.

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT,
    "credits" DOUBLE PRECISION,
    "marks" INTEGER,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT,
    "author" TEXT,
    "publisher" TEXT,
    "edition" TEXT,
    "publicationYear" INTEGER,
    "description" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_syllabusId_code_key" ON "Course"("syllabusId", "code");

-- CreateIndex
CREATE INDEX "Course_syllabusId_publicationStatus_idx" ON "Course"("syllabusId", "publicationStatus");

-- CreateIndex
CREATE INDEX "Book_courseId_publicationStatus_idx" ON "Book"("courseId", "publicationStatus");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
