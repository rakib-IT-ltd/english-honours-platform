'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApiItem } from '../../hooks/useApiItem';
import { useApiList } from '../../hooks/useApiList';
import { buildApiUrl, getApiBaseUrl } from '../../lib/api';
import { STRINGS } from '../../lib/i18n';
import { studyHref } from '../../lib/routes';
import { STUDY_TEXT } from '../../lib/studyText';
import type { SectionSummary } from '../../types/study';
import { titleFor, type BookDetail } from '../../types/academic';
import { useLanguage } from '../providers/AppProviders';
import { PageShell } from '../layout/PageShell';

/** Only same-site paths are accepted as the "back" target. */
function safeBack(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

/** Page 3: one book. */
export function BookView() {
  const { language } = useLanguage();
  const t = STRINGS[language];
  const bn = language === 'bn';
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const back = safeBack(params.get('back'));
  const base = getApiBaseUrl();
  const book = useApiItem<BookDetail>(
    base && id ? buildApiUrl(base, `books/${encodeURIComponent(id)}`) : null,
  );

  const sections = useApiList<SectionSummary>(
    base && id ? buildApiUrl(base, `books/${encodeURIComponent(id)}/sections`) : null,
  );
  const hasStudy = sections.status === 'ok' && sections.data.length > 0;

  let message: string | null = null;
  if (!id) message = t.bookNotFound;
  else if (!base) message = t.notConnected;
  else if (book.status === 'error') message = t.bookNotFound;
  else if (book.status === 'loading') message = t.loading;

  const details: [string, string | number | null][] =
    book.status === 'ok'
      ? [
          [t.byAuthor, book.data.author],
          [t.publisher, book.data.publisher],
          [t.edition, book.data.edition],
          [t.publicationYear, book.data.publicationYear],
        ]
      : [];

  return (
    <PageShell>
      <main className="form-page wide syllabus-page">
        <p>
          <Link href={back}>← {t.backToSyllabus}</Link>
        </p>
        {message ? (
          <p role="status" className="notice">
            {message}
          </p>
        ) : null}
        {book.status === 'ok' ? (
          <article>
            <h1>{titleFor(book.data, bn)}</h1>
            <p className="muted">
              {t.listedForCourse}: {book.data.course.code} · {titleFor(book.data.course, bn)}
            </p>
            <dl className="facts">
              {details.map(([label, value]) =>
                value !== null && value !== '' ? (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ) : null,
              )}
            </dl>
            {book.data.description ? <p>{book.data.description}</p> : null}
            {hasStudy ? (
              <p>
                <Link className="study-primary" href={studyHref(id)}>
                  {STUDY_TEXT[language].studyCentre} →
                </Link>
              </p>
            ) : (
              <p className="notice">{t.materialsSoon}</p>
            )}
          </article>
        ) : null}
      </main>
    </PageShell>
  );
}
