-- Study content: sections of a book, study items of eight kinds, and the student's own data
-- (bookmarks, notes, reading progress).

-- CreateEnum
CREATE TYPE "StudyResourceKind" AS ENUM ('ORIGINAL_TEXT', 'BANGLA_EXPLANATION', 'SUMMARY', 'CRITICAL_ANALYSIS', 'QUOTATION', 'QUESTION_ANSWER', 'VOCABULARY', 'CENTRAL_IDEA');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN "genre" TEXT;

-- CreateTable
CREATE TABLE "BookSection" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT,
    "subtitleEn" TEXT,
    "subtitleBn" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "kind" "StudyResourceKind" NOT NULL,
    "sequence" INTEGER NOT NULL,
    "textEn" TEXT,
    "textBn" TEXT,
    "noteEn" TEXT,
    "noteBn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionProgress" (
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SectionProgress_pkey" PRIMARY KEY ("userId","sectionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookSection_bookId_sequence_key" ON "BookSection"("bookId", "sequence");
CREATE INDEX "BookSection_bookId_publicationStatus_idx" ON "BookSection"("bookId", "publicationStatus");
CREATE UNIQUE INDEX "StudyItem_sectionId_kind_sequence_key" ON "StudyItem"("sectionId", "kind", "sequence");
CREATE UNIQUE INDEX "Bookmark_userId_sectionId_key" ON "Bookmark"("userId", "sectionId");
CREATE INDEX "Bookmark_sectionId_idx" ON "Bookmark"("sectionId");
CREATE UNIQUE INDEX "StudyNote_userId_sectionId_key" ON "StudyNote"("userId", "sectionId");
CREATE INDEX "StudyNote_sectionId_idx" ON "StudyNote"("sectionId");
CREATE INDEX "SectionProgress_sectionId_idx" ON "SectionProgress"("sectionId");

-- AddForeignKey
ALTER TABLE "BookSection" ADD CONSTRAINT "BookSection_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyItem" ADD CONSTRAINT "StudyItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BookSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BookSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyNote" ADD CONSTRAINT "StudyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyNote" ADD CONSTRAINT "StudyNote_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BookSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SectionProgress" ADD CONSTRAINT "SectionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SectionProgress" ADD CONSTRAINT "SectionProgress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BookSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rules Prisma cannot express (hand-written):
ALTER TABLE "BookSection" ADD CONSTRAINT "BookSection_sequence_positive" CHECK ("sequence" > 0);
ALTER TABLE "BookSection" ADD CONSTRAINT "BookSection_titleEn_not_blank" CHECK (btrim("titleEn") <> '');
ALTER TABLE "StudyItem" ADD CONSTRAINT "StudyItem_sequence_positive" CHECK ("sequence" > 0);
-- An item must carry some text.
ALTER TABLE "StudyItem" ADD CONSTRAINT "StudyItem_has_text" CHECK (
  coalesce(btrim("textEn"), '') <> '' OR coalesce(btrim("textBn"), '') <> ''
);
-- A personal note is 1..5000 characters.
ALTER TABLE "StudyNote" ADD CONSTRAINT "StudyNote_body_length" CHECK (char_length(btrim("body")) BETWEEN 1 AND 5000);
