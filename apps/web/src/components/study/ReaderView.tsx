'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApiItem } from '../../hooks/useApiItem';
import { useMyStudy } from '../../hooks/useMyStudy';
import { useStudyBook } from '../../hooks/useStudyBook';
import { buildApiUrl, getApiBaseUrl } from '../../lib/api';
import { studyHref, studyReadHref } from '../../lib/routes';
import { STUDY_TEXT } from '../../lib/studyText';
import { titleFor } from '../../types/academic';
import {
  CENTRAL_IDEA_COLOUR,
  RESOURCES,
  resourceBySlug,
  type SectionDetail,
  type StudyKind,
} from '../../types/study';
import { useLanguage } from '../providers/AppProviders';
import { StudyIcon } from './icons';
import { StudyFrame } from './StudyFrame';
import { StudyItems } from './StudyItems';

type Saving = 'idle' | 'saving' | 'saved' | 'error';

/** Guided reading of one section: resource tabs, bookmark, notes, previous/next, completion. */
export function ReaderView() {
  const { language } = useLanguage();
  const t = STUDY_TEXT[language];
  const bn = language === 'bn';
  const router = useRouter();
  const params = useSearchParams();
  const bookId = params.get('book') ?? '';
  const sectionId = params.get('section') ?? '';
  const view = params.get('view');
  const { connected, book } = useStudyBook(bookId);
  const mine = useMyStudy(bookId);
  const base = getApiBaseUrl();
  const section = useApiItem<SectionDetail>(
    base && sectionId ? buildApiUrl(base, `sections/${encodeURIComponent(sectionId)}`) : null,
  );

  // Opening a section counts as progress (when signed in).
  const { markOpened, canSave } = mine;
  useEffect(() => {
    if (canSave && sectionId && section.status === 'ok') void markOpened(sectionId);
  }, [canSave, sectionId, section.status, markOpened]);

  const items = section.status === 'ok' ? section.data.items : [];
  const kindsHere = new Set(items.map((item) => item.kind));
  const tabs = [
    ...RESOURCES.filter((r) => r.kind === 'NOTES' || kindsHere.has(r.kind as StudyKind)),
    ...(kindsHere.has('CENTRAL_IDEA')
      ? [
          {
            kind: 'CENTRAL_IDEA' as const,
            slug: 'ideas',
            ...CENTRAL_IDEA_COLOUR,
            background: CENTRAL_IDEA_COLOUR.background,
          },
        ]
      : []),
  ];
  const chosen =
    view === 'ideas'
      ? tabs.find((tab) => tab.kind === 'CENTRAL_IDEA')
      : (resourceBySlug(view) ?? undefined);
  const active = tabs.find((tab) => tab.kind === chosen?.kind) ?? tabs[0];
  const nameOf = (kind: string) =>
    kind === 'CENTRAL_IDEA' ? t.centralIdeas : t.resourceNames[kind];

  const done = mine.data.completedSectionIds.includes(sectionId);
  const marked = mine.data.bookmarkedSectionIds.includes(sectionId);
  const savedNote = mine.data.notes.find((n) => n.sectionId === sectionId)?.body ?? '';

  const [draft, setDraft] = useState<{ id: string; text: string } | null>(null);
  const text = draft && draft.id === sectionId ? draft.text : savedNote;
  const [saving, setSaving] = useState<Saving>('idle');

  async function onSaveNote() {
    setSaving('saving');
    try {
      await mine.saveNote(sectionId, text);
      setDraft(null);
      setSaving('saved');
    } catch {
      setSaving('error');
    }
  }

  async function onDeleteNote() {
    setSaving('saving');
    try {
      await mine.removeNote(sectionId);
      setDraft(null);
      setSaving('idle');
    } catch {
      setSaving('error');
    }
  }

  async function toggle(action: () => Promise<void>) {
    try {
      await action();
    } catch {
      // the button simply stays as it was; the student can try again
    }
  }

  const header =
    section.status === 'ok' ? (
      <div className="study-book">
        <div>
          <p className="study-crumb">
            <Link href={studyHref(bookId)}>
              {book.status === 'ok' ? titleFor(book.data, bn) : t.studyCentre}
            </Link>
          </p>
          <h1>{titleFor(section.data, bn)}</h1>
          <p>
            {t.sectionWord} {section.data.sequence}
            {(bn && section.data.subtitleBn) || section.data.subtitleEn
              ? ` · ${bn && section.data.subtitleBn ? section.data.subtitleBn : section.data.subtitleEn}`
              : ''}
          </p>
        </div>
        <button
          type="button"
          className={`study-bookmark${marked ? ' is-on' : ''}`}
          aria-pressed={marked}
          disabled={!mine.canSave}
          onClick={() => toggle(() => mine.setBookmarked(sectionId, !marked))}
        >
          <StudyIcon name="BOOKMARK" size={18} />
          <span>{marked ? t.bookmarked : t.bookmark}</span>
        </button>
      </div>
    ) : null;

  let message: string | null = null;
  if (!sectionId) message = t.loadError;
  else if (!connected) message = t.notConnected;
  else if (section.status === 'loading') message = t.loading;
  else if (section.status === 'error') message = t.loadError;

  const go = (id: string | null) =>
    id ? router.push(studyReadHref(bookId, id, active ? slugOf(active) : undefined)) : undefined;

  return (
    <StudyFrame bookId={bookId} active="reading" header={header}>
      {message ? (
        <p role="status" className="notice">
          {message}
        </p>
      ) : null}
      {section.status === 'ok' ? (
        <>
          {section.data.isSample ? <p className="study-sample">{t.sampleBanner}</p> : null}
          {!mine.canSave ? (
            <p className="muted study-signin">
              {t.signInToSave} <Link href="/login">{t.signIn}</Link>
            </p>
          ) : null}

          <div className="study-chips" role="tablist" aria-label={t.studyResources}>
            {tabs.map((tab) => (
              <Link
                key={tab.kind}
                role="tab"
                aria-selected={tab.kind === active?.kind}
                aria-current={tab.kind === active?.kind ? 'page' : undefined}
                className="study-chip"
                style={{ background: tab.background, color: tab.accent }}
                href={studyReadHref(bookId, sectionId, slugOf(tab))}
                replace
              >
                {nameOf(tab.kind)}
              </Link>
            ))}
          </div>

          <section className="study-panel" style={{ borderTopColor: active?.accent }}>
            {active?.kind === 'NOTES' ? (
              <div className="study-notes">
                <label htmlFor="study-note">{t.resourceNames['NOTES']}</label>
                <textarea
                  id="study-note"
                  rows={7}
                  maxLength={5000}
                  value={text}
                  placeholder={t.notePlaceholder}
                  disabled={!mine.canSave}
                  onChange={(event) => {
                    setSaving('idle');
                    setDraft({ id: sectionId, text: event.target.value });
                  }}
                />
                <div className="study-actions">
                  <button
                    type="button"
                    className="study-primary"
                    disabled={!mine.canSave || saving === 'saving' || text.trim() === ''}
                    onClick={() => void onSaveNote()}
                  >
                    {t.saveNote}
                  </button>
                  {savedNote ? (
                    <button
                      type="button"
                      className="study-secondary"
                      disabled={saving === 'saving'}
                      onClick={() => void onDeleteNote()}
                    >
                      {t.deleteNote}
                    </button>
                  ) : null}
                  <span role="status" className="muted">
                    {saving === 'saved' ? t.noteSaved : saving === 'error' ? t.noteError : ''}
                  </span>
                </div>
              </div>
            ) : active ? (
              <StudyItems
                kind={active.kind as StudyKind}
                items={items.filter((item) => item.kind === active.kind)}
                language={language}
              />
            ) : (
              <p className="muted">{t.noMaterial}</p>
            )}
          </section>

          <div className="study-actions">
            <button
              type="button"
              className={done ? 'study-secondary' : 'study-primary'}
              disabled={!mine.canSave}
              onClick={() => toggle(() => mine.setCompleted(sectionId, !done))}
            >
              {done ? `✓ ${t.completed} · ${t.reopen}` : t.markComplete}
            </button>
          </div>

          <div className="study-pager">
            <button
              type="button"
              disabled={!section.data.previousSectionId}
              onClick={() => go(section.data.previousSectionId)}
            >
              ← {t.previous}
            </button>
            <button
              type="button"
              disabled={!section.data.nextSectionId}
              onClick={() => go(section.data.nextSectionId)}
            >
              {t.next} →
            </button>
          </div>
        </>
      ) : null}
    </StudyFrame>
  );
}

function slugOf(tab: { kind: string; slug: string }): string {
  return tab.slug;
}
