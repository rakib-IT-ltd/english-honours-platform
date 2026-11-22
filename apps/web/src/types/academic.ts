import type { VerificationStatus } from '@ehp/shared-types';

/** Shapes returned by the API (see Swagger). Only the fields the website uses. */
export interface Named {
  id: string;
  nameEn: string;
  nameBn: string | null;
}

export type University = Named & { code: string };
export type AcademicProgram = Named & { universityId: string; code: string };
export type AcademicLevel = Named & { code: string; sequence: number };

export interface SyllabusSummary {
  id: string;
  versionLabel: string;
  verificationStatus: VerificationStatus;
  isCurrent: boolean;
}
