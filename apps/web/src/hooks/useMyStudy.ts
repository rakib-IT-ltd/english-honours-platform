'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../components/providers/AppProviders';
import { getApiBaseUrl } from '../lib/api';
import { getIdToken } from '../lib/auth/authClient';
import * as api from '../lib/studyApi';
import type { MyStudy } from '../types/study';

const EMPTY: MyStudy = {
  completedSectionIds: [],
  lastSectionId: null,
  bookmarkedSectionIds: [],
  notes: [],
};

/**
 * The signed-in student's progress, bookmarks and notes for one book. When nobody is signed in the
 * data is empty and `canSave` is false (the screens then offer sign-in instead).
 */
export function useMyStudy(bookId: string) {
  const { status } = useAuth();
  const canSave = status === 'signedIn' && Boolean(getApiBaseUrl());
  const [data, setData] = useState<MyStudy>(EMPTY);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canSave || !bookId) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const mine = await api.getMyStudy(token, bookId);
        if (!cancelled) setData(mine);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canSave, bookId]);

  const withToken = useCallback(async <T>(run: (token: string) => Promise<T>): Promise<T> => {
    const token = await getIdToken();
    if (!token) throw new Error('not signed in');
    return run(token);
  }, []);

  /** Records that the section was opened (and optionally completed). Failures are silent. */
  const markOpened = useCallback(
    async (sectionId: string, completed = false) => {
      if (!canSave) return;
      try {
        await withToken((token) => api.setProgress(token, sectionId, completed));
        setData((current) => ({
          ...current,
          lastSectionId: sectionId,
          completedSectionIds: completed
            ? [...new Set([...current.completedSectionIds, sectionId])]
            : current.completedSectionIds,
        }));
      } catch {
        // progress is a convenience; reading continues without it
      }
    },
    [canSave, withToken],
  );

  const setCompleted = useCallback(
    async (sectionId: string, completed: boolean) => {
      await withToken((token) => api.setProgress(token, sectionId, completed));
      setData((current) => ({
        ...current,
        lastSectionId: sectionId,
        completedSectionIds: completed
          ? [...new Set([...current.completedSectionIds, sectionId])]
          : current.completedSectionIds.filter((id) => id !== sectionId),
      }));
    },
    [withToken],
  );

  const setBookmarked = useCallback(
    async (sectionId: string, on: boolean) => {
      await withToken((token) => api.setBookmark(token, sectionId, on));
      setData((current) => ({
        ...current,
        bookmarkedSectionIds: on
          ? [...new Set([...current.bookmarkedSectionIds, sectionId])]
          : current.bookmarkedSectionIds.filter((id) => id !== sectionId),
      }));
    },
    [withToken],
  );

  const saveNote = useCallback(
    async (sectionId: string, body: string) => {
      const note = await withToken((token) => api.saveNote(token, sectionId, body));
      setData((current) => ({
        ...current,
        notes: [...current.notes.filter((n) => n.sectionId !== sectionId), note],
      }));
    },
    [withToken],
  );

  const removeNote = useCallback(
    async (sectionId: string) => {
      await withToken((token) => api.deleteNote(token, sectionId));
      setData((current) => ({
        ...current,
        notes: current.notes.filter((n) => n.sectionId !== sectionId),
      }));
    },
    [withToken],
  );

  return { data, canSave, failed, markOpened, setCompleted, setBookmarked, saveNote, removeNote };
}
