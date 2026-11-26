'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useMyStudy } from '../../hooks/useMyStudy';
import { useStudyBook } from '../../hooks/useStudyBook';
import { STRINGS } from '../../lib/i18n';
import { STUDY_TEXT } from '../../lib/studyText';
import { studyReadHref, studyResourceHref } from '../../lib/routes';
import { titleFor } from '../../types/academic';
import { RESOURCES, type SectionSummary } from '../../types/study';
import { useLanguage } from '../providers/AppProviders';
import { StudyIcon } from './icons';
import { StudyFrame } from './StudyFrame';

/** Where "Continue reading" goes: the last opened section if unfinished, else the next unfinished. */
export function pickCurrentSection(
  sections: SectionSummary[],
  completed: string[],
  lastId: string | null,
): SectionSummary | null {
  if (sections.length === 0) return null;
  const done = new Set(completed);
  const last = sections.find((s) => s.id === lastId);
  if (last && !done.has(last.id)) return last;
  const startIndex = last ? sections.indexOf(last) : -1;
  const after = sections.slice(startIndex + 1).find((s) => !done.has(s.id));
  return after ?? sections.find((s) => !done.has(s.id)) ?? sections[0] ?? null;
}

/** The study centre of one book (screen 1 of the study flow). */
export function StudyCentre() {
  const { language } = useLanguage();
  const t = STUDY_TEXT[language];
  const bn = language === 'bn';
  const params = useSearchParams();
  const bookId = params.get('book') ?? '';
  const rawBack = params.get('back');
  const backHref = rawBack && rawBack.startsWith('/') && !rawBack.startsWith('//') ? rawBack : '/';
  const { connected, book, sections } = useStudyBook(bookId);
  const mine = useMyStudy(bookId);

  const list = useMemo(() => (sections.status === 'ok' ? sections.data : []), [sections]);
  const available = useMemo(
    () => new Set(list.flatMap((section) => section.availableKinds)),
    [list],
  );
  const current = pickCurrentSection(list, mine.data.completedSectionIds, mine.data.lastSectionId);
  const percent = list.length
    ? Math.round(
        (list.filter((s) => mine.data.completedSectionIds.includes(s.id)).length / list.length) *
          100,
      )
    : 0;

  const header =
    book.status === 'ok' ? (
      <div className="study-book">
        <div>
          <h1>{titleFor(book.data, bn)}</h1>
          <p>{[book.data.author, book.data.publicationYear].filter(Boolean).join(' · ')}</p>
          <p>
            {book.data.course.code} · {titleFor(book.data.course, bn)}
          </p>
        </div>
        {book.data.genre ? <span className="study-genre">{book.data.genre}</span> : null}
      </div>
    ) : null;

  let message: string | null = null;
  if (!bookId || book.status === 'error') message = t.loadError;
  else if (!connected) message = t.notConnected;
  else if (book.status === 'loading' || sections.status === 'loading') message = t.loading;
  else if (sections.status === 'ok' && list.length === 0) message = t.noSections;

  const isSample = list.some((section) => section.isSample);

  return (
    <StudyFrame bookId={bookId} active="reading" header={header}>
      {message ? (
        <p role="status" className="notice">
          {message}
        </p>
      ) : null}
      {book.status === 'ok' && list.length > 0 ? (
        <>
          <h2 className="study-h2">{t.yourStudyCentre}</h2>
          <p className="muted study-lead">{t.exploreEssay}</p>
          {isSample ? <p className="study-sample">{t.sampleBanner}</p> : null}

          {current ? (
            <section className="study-continue" aria-label={t.continueLearning}>
              <span className="study-pill">{t.continueLearning}</span>
              <h3>{titleFor(book.data, bn)}</h3>
              <p className="muted">
                {t.currentSection}: {titleFor(current, bn)}
              </p>
              <div className="study-progress-row">
                <span>{t.readingProgress}</span>
                <span>{percent}%</span>
              </div>
              <div
                className="study-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
              <Link className="study-primary" href={studyReadHref(bookId, current.id)}>
                {mine.data.lastSectionId ? t.continueReading : t.startReading} →
              </Link>
            </section>
          ) : null}

          {!mine.canSave ? (
            <p className="muted study-signin">
              {t.signInToSave} <Link href="/login">{t.signIn}</Link>
            </p>
          ) : null}

          <h2 className="study-h3">{t.studyResources}</h2>
          <div className="study-grid">
            {RESOURCES.map((resource) => {
              const enabled = resource.kind === 'NOTES' || available.has(resource.kind);
              const style = { background: resource.background, color: resource.accent };
              const inner = (
                <>
                  <StudyIcon name={resource.kind} />
                  <strong>{t.resourceNames[resource.kind]}</strong>
                  <small>{enabled ? t.resourceHints[resource.kind] : t.notAvailableYet}</small>
                </>
              );
              return enabled ? (
                <Link
                  key={resource.kind}
                  className="study-tile"
                  style={style}
                  href={studyResourceHref(bookId, resource.slug)}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={resource.kind}
                  className="study-tile is-off"
                  style={style}
                  aria-disabled="true"
                >
                  {inner}
                </div>
              );
            })}
          </div>

          <h2 className="study-h3">
            {t.structure} · {list.length} {t.sectionsWord}
          </h2>
          <ol className="study-sections">
            {list.map((section) => {
              const done = mine.data.completedSectionIds.includes(section.id);
              const marked = mine.data.bookmarkedSectionIds.includes(section.id);
              const subtitle = bn && section.subtitleBn ? section.subtitleBn : section.subtitleEn;
              return (
                <li key={section.id}>
                  <Link href={studyReadHref(bookId, section.id)}>
                    <span className={`study-num${done ? ' is-done' : ''}`}>
                      {done ? '✓' : section.sequence}
                    </span>
                    <span className="study-sec-text">
                      <strong>{titleFor(section, bn)}</strong>
                      {subtitle ? <small>{subtitle}</small> : null}
                    </span>
                    {marked ? (
                      <span className="study-marked" aria-label={t.bookmarked}>
                        <StudyIcon name="BOOKMARK" size={16} />
                      </span>
                    ) : null}
                    <StudyIcon name="CHEVRON" size={16} />
                  </Link>
                </li>
              );
            })}
          </ol>
          <p>
            <Link href={backHref}>← {STRINGS[language].backToSyllabus}</Link>
          </p>
        </>
      ) : null}
    </StudyFrame>
  );
}
