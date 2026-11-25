-- Class hours per course, as printed in the official syllabus (optional).
ALTER TABLE "Course" ADD COLUMN "classHours" INTEGER;
ALTER TABLE "Course" ADD CONSTRAINT "Course_classHours_check" CHECK ("classHours" IS NULL OR "classHours" > 0);
