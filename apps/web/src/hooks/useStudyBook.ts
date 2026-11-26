'use client';

import { useApiItem } from './useApiItem';
import { useApiList } from './useApiList';
import { buildApiUrl, getApiBaseUrl } from '../lib/api';
import type { BookDetail } from '../types/academic';
import type { SectionSummary } from '../types/study';

/** The book and its published sections. `connected` is false when no API is configured. */
export function useStudyBook(bookId: string) {
  const base = getApiBaseUrl();
  const id = encodeURIComponent(bookId);
  const book = useApiItem<BookDetail>(base && bookId ? buildApiUrl(base, `books/${id}`) : null);
  const sections = useApiList<SectionSummary>(
    base && bookId ? buildApiUrl(base, `books/${id}/sections`) : null,
  );
  return { connected: Boolean(base), book, sections };
}
