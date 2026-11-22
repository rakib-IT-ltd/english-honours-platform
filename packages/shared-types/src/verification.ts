/** Verification state of academic content against an official source (mirrors the DB enum). */
export const VERIFICATION_STATUSES = ['UNVERIFIED', 'VERIFIED'] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Kind of academic program (mirrors the DB enum). */
export const PROGRAMME_TYPES = ['HONOURS', 'MASTERS'] as const;

export type ProgrammeType = (typeof PROGRAMME_TYPES)[number];

/** Kind of syllabus source document (mirrors the DB enum). Only the first can support verification. */
export const SYLLABUS_SOURCE_TYPES = ['OFFICIAL_UNIVERSITY_DOCUMENT', 'OTHER'] as const;

export type SyllabusSourceType = (typeof SYLLABUS_SOURCE_TYPES)[number];
