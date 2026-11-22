/** Verification state of academic content against an official source (mirrors the DB enum). */
export const VERIFICATION_STATUSES = ['UNVERIFIED', 'VERIFIED'] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
