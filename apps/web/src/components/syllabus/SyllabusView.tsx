'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApiItem } from '../../hooks/useApiItem';
import { useApiList } from '../../hooks/useApiList';
import { buildApiUrl, getApiBaseUrl } from '../../lib/api';
import { displayName, STRINGS } from '../../lib/i18n';
import { bookHref, syllabusHref } from '../../lib/routes';
import {
  titleFor,
  type AcademicLevel,
  type AcademicProgram,
  type Book,
  type Course,
  type Department,
  type SyllabusSummary,
  type University,
} from '../../types/academic';
import { useLanguage } from '../providers/AppProviders';
import { PageShell } from '../layout/PageShell';

/** Page 2: where the student sees the syllabus and the list of books for their selection. */
export function SyllabusView() {
  const { language } = useLanguage();
  const t = STRINGS[language];
  const bn = language === 'bn';
  const params = useSearchParams();
  const universityId = params.get('university') ?? '';
  const programId = params.get('program') ?? '';
  const levelId = params.get('level') ?? '';
  const complete = Boolean(universityId && programId && levelId);
  const base = getApiBaseUrl();
  const enabled = Boolean(base && complete);

  const university = useApiItem<University>(
    enabled && base ? buildApiUrl(base, `universities/${encodeURIComponent(universityId)}`) : null,
  );
  const program = useApiItem<AcademicProgram>(
    enabled && base
      ? buildApiUrl(base, `academic-programs/${encodeURIComponent(programId)}`)
      : null,
  );
  const level = useApiItem<AcademicLevel>(
    enabled && base ? buildApiUrl(base, `academic-levels/${encodeURIComponent(levelId)}`) : null,
  );
  const departments = useApiList<Department>(
    enabled && base ? buildApiUrl(base, 'departments', { universityId }) : null,
  );
  const syllabuses = useApiList<SyllabusSummary>(
    enabled && base
      ? buildApiUrl(base, 'syllabuses', {
          universityId,
          academicProgramId: programId,
          academicLevelId: levelId,
          isCurrent: 'true',
        })
      : null,
  );
  const syllabus = syllabuses.status === 'ok' ? syllabuses.data[0] : undefined;
  const courses = useApiList<Course>(
    base && syllabus ? buildApiUrl(base, 'courses', { syllabusId: syllabus.id }) : null,
  );
  const books = useApiList<Book>(
    base && syllabus ? buildApiUrl(base, 'books', { syllabusId: syllabus.id }) : null,
  );

  const here = syllabusHref({ universityId, programId, levelId });
  const departmentName =
    program.status === 'ok' && departments.status === 'ok'
      ? departments.data.find((item) => item.id === program.data.departmentId)
      : undefined;
  const courseItems = courses.status === 'ok' ? courses.data : [];
  const bookItems = books.status === 'ok' ? books.data : [];

  let problem: string | null = null;
  if (!complete) problem = t.selectionMissing;
  else if (!base) problem = t.notConnected;
  else if (
    [university, program, level, departments, syllabuses].some((state) => state.status === 'error')
  )
    problem = t.loadError;

  return (
    <PageShell>
      <main className="form-page wide syllabus-page">
        <p>
          <Link href="/">← {t.chooseAgain}</Link>
        </p>
        <h1>{t.syllabusPageTitle}</h1>

        {problem ? (
          <p role="status" className="notice">
            {problem}
          </p>
        ) : (
          <>
            <ul className="crumbs" aria-label={t.syllabusPageTitle}>
              {university.status === 'ok' ? (
                <li>{displayName(university.data, language)}</li>
              ) : null}
              {departmentName ? <li>{displayName(departmentName, language)}</li> : null}
              {program.status === 'ok' ? <li>{displayName(program.data, language)}</li> : null}
              {level.status === 'ok' ? <li>{displayName(level.data, language)}</li> : null}
            </ul>

            {syllabuses.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
            {syllabuses.status === 'ok' && !syllabus ? (
              <p role="status" className="notice">
                {t.noSyllabus}
              </p>
            ) : null}
            {syllabus ? (
              <p>
                {t.version}: {syllabus.versionLabel}{' '}
                <span className={syllabus.verificationStatus === 'VERIFIED' ? 'badge ok' : 'badge'}>
                  {syllabus.verificationStatus === 'VERIFIED' ? t.verified : t.unverified}
                </span>
              </p>
            ) : null}

            {syllabus ? (
              <>
                <section aria-labelledby="courses-title" className="listing">
                  <h2 id="courses-title">{t.courseListTitle}</h2>
                  {courses.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
                  {courses.status === 'error' ? <p>{t.loadError}</p> : null}
                  {courses.status === 'ok' && courseItems.length === 0 ? (
                    <p className="notice">{t.noCourses}</p>
                  ) : null}
                  <ul className="card-list">
                    {courseItems.map((course) => (
                      <li key={course.id} className="card">
                        <span className="card-code">{course.code}</span>
                        <span className="card-title">{titleFor(course, bn)}</span>
                        <span className="card-meta">
                          {course.credits !== null ? `${t.credits}: ${course.credits}` : null}
                          {course.credits !== null && course.marks !== null ? ' · ' : null}
                          {course.marks !== null ? `${t.marks}: ${course.marks}` : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="books-title" className="listing">
                  <h2 id="books-title">{t.bookListTitle}</h2>
                  {books.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
                  {books.status === 'error' ? <p>{t.loadError}</p> : null}
                  {books.status === 'ok' && bookItems.length === 0 ? (
                    <p className="notice">{t.noBooks}</p>
                  ) : null}
                  <ul className="card-list">
                    {bookItems.map((book) => {
                      const course = courseItems.find((item) => item.id === book.courseId);
                      return (
                        <li key={book.id} className="card">
                          <Link className="card-link" href={bookHref(book.id, here)}>
                            <span className="card-title">{titleFor(book, bn)}</span>
                            {book.author ? (
                              <span className="card-meta">
                                {t.byAuthor} {book.author}
                              </span>
                            ) : null}
                            {course ? (
                              <span className="card-meta">
                                {course.code} · {titleFor(course, bn)}
                              </span>
                            ) : null}
                            <span className="card-open">{t.openBook} →</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </>
            ) : null}
          </>
        )}
      </main>
    </PageShell>
  );
}
