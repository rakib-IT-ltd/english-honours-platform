-- Users (one per Firebase account) and student profiles (academic identity).

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "academicProgramId" TEXT NOT NULL,
    "academicLevelId" TEXT NOT NULL,
    "academicSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "StudentProfile_universityId_idx" ON "StudentProfile"("universityId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_academicProgramId_universityId_fkey" FOREIGN KEY ("academicProgramId", "universityId") REFERENCES "AcademicProgram"("id", "universityId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_academicProgramId_academicLevelId_fkey" FOREIGN KEY ("academicProgramId", "academicLevelId") REFERENCES "ProgramLevel"("programId", "levelId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_academicSessionId_universityId_fkey" FOREIGN KEY ("academicSessionId", "universityId") REFERENCES "AcademicSession"("id", "universityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Manual addition (CHECK constraint; Prisma ignores it when diffing).
ALTER TABLE "User" ADD CONSTRAINT "User_preferredLanguage_check" CHECK ("preferredLanguage" IN ('en', 'bn'));
