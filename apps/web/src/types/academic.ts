import type { VerificationStatus } from '@ehp/shared-types';

/** Shapes returned by the API (see Swagger). Only the fields the website uses. */
export interface Named {
  id: string;
  nameEn: string;
  nameBn: string | null;
}

export type University = Named & { code: string };
export type AcademicProgram = Named & { universityId: string; departmentId: string; code: string };
export type Department = Named & { universityId: string; code: string };
export type AcademicLevel = Named & { code: string; sequence: number };

export interface SyllabusSummary {
  id: string;
  versionLabel: string;
  verificationStatus: VerificationStatus;
  isCurrent: boolean;
}

export interface Course {
  id: string;
  syllabusId: string;
  code: string;
  titleEn: string;
  titleBn: string | null;
  credits: number | null;
  marks: number | null;
  sequence: number;
}

export interface Book {
  id: string;
  courseId: string;
  titleEn: string;
  titleBn: string | null;
  author: string | null;
  publisher: string | null;
  edition: string | null;
  publicationYear: number | null;
  description: string | null;
  sequence: number;
}

export type BookDetail = Book & {
  course: Pick<Course, 'id' | 'syllabusId' | 'code' | 'titleEn' | 'titleBn'>;
};

/** Title in the chosen language, falling back to English. */
export function titleFor(item: { titleEn: string; titleBn: string | null }, bn: boolean): string {
  return bn && item.titleBn ? item.titleBn : item.titleEn;
}
