import type { SupportedLanguage } from '@ehp/shared-types';

export type StudyKind =
  | 'ORIGINAL_TEXT'
  | 'BANGLA_EXPLANATION'
  | 'SUMMARY'
  | 'CRITICAL_ANALYSIS'
  | 'QUOTATION'
  | 'QUESTION_ANSWER'
  | 'VOCABULARY'
  | 'CENTRAL_IDEA';

export interface StudyItem {
  id: string;
  kind: StudyKind;
  sequence: number;
  textEn: string | null;
  textBn: string | null;
  noteEn: string | null;
  noteBn: string | null;
}

export interface SectionSummary {
  id: string;
  bookId: string;
  sequence: number;
  titleEn: string;
  titleBn: string | null;
  subtitleEn: string | null;
  subtitleBn: string | null;
  isSample: boolean;
  availableKinds: StudyKind[];
}

export interface SectionDetail extends Omit<SectionSummary, 'availableKinds'> {
  items: StudyItem[];
  previousSectionId: string | null;
  nextSectionId: string | null;
}

export interface ResourceSection {
  id: string;
  sequence: number;
  titleEn: string;
  titleBn: string | null;
  isSample: boolean;
  items: StudyItem[];
}

export interface StudyNote {
  sectionId: string;
  body: string;
  updatedAt: string;
}

export interface MyStudy {
  completedSectionIds: string[];
  lastSectionId: string | null;
  bookmarkedSectionIds: string[];
  notes: StudyNote[];
}

/** The eight study resources, in the order of the study-centre grid, with their soft colours. */
export const RESOURCES: readonly {
  kind: StudyKind | 'NOTES';
  slug: string;
  background: string;
  accent: string;
}[] = [
  { kind: 'ORIGINAL_TEXT', slug: 'original', background: '#E7F0FF', accent: '#24539f' },
  { kind: 'BANGLA_EXPLANATION', slug: 'bangla', background: '#F0EAFE', accent: '#5a3fa6' },
  { kind: 'SUMMARY', slug: 'summary', background: '#E5F5EA', accent: '#1d7342' },
  { kind: 'CRITICAL_ANALYSIS', slug: 'analysis', background: '#FFF0E3', accent: '#a64f17' },
  { kind: 'QUOTATION', slug: 'quotations', background: '#FCEAF0', accent: '#a82a56' },
  { kind: 'QUESTION_ANSWER', slug: 'qa', background: '#E4F5F4', accent: '#14706c' },
  { kind: 'VOCABULARY', slug: 'vocabulary', background: '#FFF7DF', accent: '#7f6200' },
  { kind: 'NOTES', slug: 'notes', background: '#ECEFF3', accent: '#424d5e' },
];

export function resourceBySlug(slug: string | null) {
  return RESOURCES.find((resource) => resource.slug === slug) ?? null;
}

export function resourceByKind(kind: StudyKind | 'NOTES') {
  return RESOURCES.find((resource) => resource.kind === kind);
}

export const CENTRAL_IDEA_COLOUR = { background: '#E9F1FA', accent: '#0b2a5b' };

/** Bangla text when the language is Bangla and it exists; otherwise English (and the reverse). */
export function pickText(
  english: string | null,
  bangla: string | null,
  language: SupportedLanguage,
): string | null {
  const preferred = language === 'bn' ? bangla : english;
  return preferred ?? (language === 'bn' ? english : bangla);
}
