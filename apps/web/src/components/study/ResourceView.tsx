'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApiList } from '../../hooks/useApiList';
import { useMyStudy } from '../../hooks/useMyStudy';
import { useStudyBook } from '../../hooks/useStudyBook';
import { buildApiUrl, getApiBaseUrl } from '../../lib/api';
import { studyHref, studyReadHref, studyResourceHref } from '../../lib/routes';
import { STUDY_TEXT } from '../../lib/studyText';
import { titleFor } from '../../types/academic';
import { RESOURCES, resourceBySlug, type ResourceSection, type StudyKind } from '../../types/study';
import { useLanguage } from '../providers/AppProviders';
import { StudyIcon } from './icons';
import { StudyFrame } from './StudyFrame';
import { StudyItems } from './StudyItems';

/** One study resource across all sections of a book (e.g. all vocabulary, all my notes). */
export function ResourceView() {
  const { language } = useLanguage();
  const t = STUDY_TEXT[language];
  const bn = language === 'bn';
  const params = useSearchParams();
  const bookId = params.get('book') ?? '';
  const resource = resourceBySlug(params.get('kind'));
  const { connected, book, sections } = useStudyBook(bookId);
  const mine = useMyStudy(bookId);

  const base = getApiBaseUrl();
  const isNotes = resource?.kind === 'NOTES';
  const url =
    base && bookId && resource && !isNotes
      ? buildApiUrl(base, `books/${encodeURIComponent(bookId)}/resources/${resource.kind}`)
      : null;
  const content = useApiList<ResourceSection>(url);

  const header = (
    <div className="study-book">
      <div>
        <h1>{resource ? t.resourceNames[resource.kind] : t.studyCentre}</h1>
        <p>{book.status === 'ok' ? titleFor(book.data, bn) : ''}</p>
      </div>
    </div>
  );

  const sectionList = sections.status === 'ok' ? sections.data : [];
  let message: string | null = null;
  if (!resource || !bookId) message = t.loadError;
  else if (!connected) message = t.notConnected;
  else if (!isNotes && content.status === 'loading') message = t.loading;
  else if (!isNotes && content.status === 'error') message = t.loadError;

  return (
    <StudyFrame bookId={bookId} active={isNotes ? 'notes' : 'reading'} header={header}>
      <p>
        <Link href={studyHref(bookId)}>← {t.studyCentre}</Link>
      </p>

      {isNotes ? null : (
        <div className="study-chips" role="tablist" aria-label={t.studyResources}>
          {RESOURCES.map((entry) => (
            <Link
              key={entry.kind}
              href={studyResourceHref(bookId, entry.slug)}
              className="study-chip"
              style={{ background: entry.background, color: entry.accent }}
              aria-current={entry.kind === resource?.kind ? 'page' : undefined}
            >
              {t.resourceNames[entry.kind]}
            </Link>
          ))}
        </div>
      )}

      {message ? (
        <p role="status" className="notice">
          {message}
        </p>
      ) : null}

      {isNotes ? (
        <>
          {!mine.canSave ? (
            <p className="notice">
              {t.signInToSave} <Link href="/login">{t.signIn}</Link>
            </p>
          ) : mine.data.notes.length === 0 ? (
            <p className="muted">{t.noNotes}</p>
          ) : (
            <div className="study-list">
              {mine.data.notes.map((note) => {
                const section = sectionList.find((s) => s.id === note.sectionId);
                return (
                  <article key={note.sectionId} className="study-card">
                    <h3>
                      {t.sectionWord} {section?.sequence}: {section ? titleFor(section, bn) : ''}
                    </h3>
                    <p className="study-note-body">{note.body}</p>
                    <Link href={studyReadHref(bookId, note.sectionId, 'notes')}>
                      {t.openSection} →
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : content.status === 'ok' ? (
        content.data.length === 0 ? (
          <p className="muted">{t.noMaterial}</p>
        ) : (
          <div className="study-list">
            {content.data.map((section) => (
              <article
                key={section.id}
                className="study-card"
                style={{ borderTopColor: resource?.accent }}
              >
                <h3>
                  <span className="study-num">{section.sequence}</span> {titleFor(section, bn)}
                </h3>
                {section.isSample ? <p className="study-sample">{t.sample}</p> : null}
                <StudyItems
                  kind={resource?.kind as StudyKind}
                  items={section.items}
                  language={language}
                />
                <p>
                  <Link
                    href={studyReadHref(bookId, section.id, resource?.slug)}
                    aria-label={`${t.openSection}: ${titleFor(section, bn)}`}
                  >
                    {t.openSection} <StudyIcon name="CHEVRON" size={14} />
                  </Link>
                </p>
              </article>
            ))}
          </div>
        )
      ) : null}
    </StudyFrame>
  );
}
