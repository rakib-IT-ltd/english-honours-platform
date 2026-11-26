/** The kinds of study material; mirrors the StudyResourceKind enum in the database. */
export const STUDY_KINDS = [
  'ORIGINAL_TEXT',
  'BANGLA_EXPLANATION',
  'SUMMARY',
  'CRITICAL_ANALYSIS',
  'QUOTATION',
  'QUESTION_ANSWER',
  'VOCABULARY',
  'CENTRAL_IDEA',
] as const;

export type StudyKind = (typeof STUDY_KINDS)[number];

export function isStudyKind(value: unknown): value is StudyKind {
  return typeof value === 'string' && (STUDY_KINDS as readonly string[]).includes(value);
}
