'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useApiItem } from '../../hooks/useApiItem';
import { useApiList } from '../../hooks/useApiList';
import { buildApiUrl, getApiBaseUrl } from '../../lib/api';
import { displayName, STRINGS } from '../../lib/i18n';
import { bookHref, syllabusHref } from '../../lib/routes';
import {
  titleFor,
  type AcademicLevel,
  type AcademicProgram,
  type AcademicSessionItem,
  type Book,
  type Course,
  type Department,
  type SyllabusSummary,
  type University,
} from '../../types/academic';
import { useLanguage } from '../providers/AppProviders';
import { PageShell } from '../layout/PageShell';
import { BooksArt } from './BooksArt';

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
  const session = useApiItem<AcademicSessionItem>(
    base && syllabus
      ? buildApiUrl(base, `academic-sessions/${encodeURIComponent(syllabus.academicSessionId)}`)
      : null,
  );
  const courses = useApiList<Course>(
    base && syllabus ? buildApiUrl(base, 'courses', { syllabusId: syllabus.id }) : null,
  );
  const books = useApiList<Book>(
    base && syllabus ? buildApiUrl(base, 'books', { syllabusId: syllabus.id }) : null,
  );

  const here = syllabusHref({ universityId, programId, levelId });
  const [tab, setTab] = useState<'syllabus' | 'courses' | 'resources'>('syllabus');
  const [courseFilter, setCourseFilter] = useState('');
  const departmentName =
    program.status === 'ok' && departments.status === 'ok'
      ? departments.data.find((item) => item.id === program.data.departmentId)
      : undefined;
  const courseItems = courses.status === 'ok' ? courses.data : [];
  const bookItems = (books.status === 'ok' ? books.data : []).filter(
    (book) => !courseFilter || book.courseId === courseFilter,
  );

  let problem: string | null = null;
  if (!complete) problem = t.selectionMissing;
  else if (!base) problem = t.notConnected;
  else if (
    [university, program, level, departments, syllabuses].some((state) => state.status === 'error')
  )
    problem = t.loadError;

  const uniName = university.status === 'ok' ? displayName(university.data, language) : '';
  const levelName = level.status === 'ok' ? displayName(level.data, language) : '';
  const tabs = [
    ['syllabus', t.tabSyllabus],
    ['courses', t.tabCourses],
    ['resources', t.tabResources],
  ] as const;

  return (
    <PageShell>
      <main className="syl-page">
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumb">
            <li>
              <Link href="/">{t.navHome}</Link>
            </li>
            {uniName ? (
              <li>
                {t.universityLabel}: {uniName}
              </li>
            ) : null}
            {levelName ? <li aria-current="page">{levelName}</li> : null}
          </ol>
        </nav>

        {problem ? (
          <p role="status" className="notice">
            {problem} <Link href="/">{t.chooseAgain}</Link>
          </p>
        ) : (
          <>
            <section className="syl-banner" aria-label={t.syllabusPageTitle}>
              <span className="uni-badge" aria-hidden="true">
                {university.status === 'ok' ? university.data.code.toUpperCase() : ''}
              </span>
              <div className="syl-banner-text">
                {uniName ? (
                  <span className="selected-chip">
                    {t.selectedUniversity}: {uniName}
                  </span>
                ) : null}
                <h1>{levelName || t.syllabusPageTitle}</h1>
                <p>{t.exploreLine}</p>
              </div>
              <BooksArt />
            </section>

            <div className="tabs" role="tablist" aria-label={t.syllabusPageTitle}>
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`tab-${key}`}
                  aria-selected={tab === key}
                  aria-controls={`panel-${key}`}
                  className="tab"
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {syllabuses.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
            {syllabuses.status === 'ok' && !syllabus ? (
              <p role="status" className="notice">
                {t.noSyllabus}
              </p>
            ) : null}

            {tab === 'syllabus' && syllabus ? (
              <div role="tabpanel" id="panel-syllabus" aria-labelledby="tab-syllabus">
                <section className="panel" aria-labelledby="overview-title">
                  <div className="panel-head">
                    <h2 id="overview-title">{t.overviewTitle}</h2>
                    <span
                      className={syllabus.verificationStatus === 'VERIFIED' ? 'badge ok' : 'badge'}
                    >
                      {syllabus.verificationStatus === 'VERIFIED' ? t.verified : t.unverified}
                    </span>
                  </div>
                  <div className="stat-grid">
                    <div className="stat">
                      <span>{t.statProgram}</span>
                      <strong>
                        {program.status === 'ok' ? displayName(program.data, language) : '…'}
                      </strong>
                    </div>
                    <div className="stat">
                      <span>{t.statVersion}</span>
                      <strong>{syllabus.versionLabel}</strong>
                    </div>
                    <div className="stat">
                      <span>{t.statCourses}</span>
                      <strong>{courses.status === 'ok' ? courseItems.length : '…'}</strong>
                    </div>
                    <div className="stat">
                      <span>{t.statBooks}</span>
                      <strong>{books.status === 'ok' ? books.data.length : '…'}</strong>
                    </div>
                  </div>
                  {departmentName ? (
                    <p className="info-note">
                      {t.departmentLabel}: {displayName(departmentName, language)}
                    </p>
                  ) : null}
                  {session.status === 'ok' ? (
                    <p className="info-note">
                      {t.sessionLabel}: {session.data.label}. {t.sessionNote}
                    </p>
                  ) : null}
                  <p className="info-note">
                    {syllabus.verificationStatus === 'VERIFIED' ? t.verifiedNote : t.unverifiedNote}
                  </p>
                </section>

                <section className="panel" aria-labelledby="books-title">
                  <div className="panel-head">
                    <h2 id="books-title">{t.bookListTitle}</h2>
                    {courseItems.length > 1 ? (
                      <select
                        aria-label={t.filterByCourse}
                        value={courseFilter}
                        onChange={(event) => setCourseFilter(event.target.value)}
                      >
                        <option value="">{t.allCourses}</option>
                        {courseItems.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.code} · {titleFor(course, bn)}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                  {books.status === 'loading' ? (
                    <p className="panel-body muted">{t.loading}</p>
                  ) : null}
                  {books.status === 'error' ? <p className="panel-body">{t.loadError}</p> : null}
                  {books.status === 'ok' && bookItems.length === 0 ? (
                    <p className="panel-body">{t.noBooks}</p>
                  ) : null}
                  <ul className="plain-list">
                    {bookItems.map((book) => {
                      const course = courseItems.find((item) => item.id === book.courseId);
                      const title = titleFor(book, bn);
                      return (
                        <li key={book.id} className="book-row">
                          <span className="book-cover" aria-hidden="true">
                            {title.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="book-info">
                            <h3>{title}</h3>
                            {book.author ? (
                              <p>
                                {t.byAuthor} {book.author}
                              </p>
                            ) : null}
                            {book.publisher ? (
                              <p>
                                {t.publisher}: {book.publisher}
                              </p>
                            ) : null}
                            {course ? (
                              <p className="muted">
                                {course.code} · {titleFor(course, bn)}
                              </p>
                            ) : null}
                          </div>
                          <Link className="details-button" href={bookHref(book.id, here)}>
                            {t.viewDetails} →
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <p className="tip-note">{t.materialsSoon}</p>
              </div>
            ) : null}

            {tab === 'courses' && syllabus ? (
              <div role="tabpanel" id="panel-courses" aria-labelledby="tab-courses">
                <section className="panel" aria-labelledby="courses-title">
                  <div className="panel-head">
                    <h2 id="courses-title">{t.courseListTitle}</h2>
                  </div>
                  <div className="panel-body">
                    {courses.status === 'loading' ? <p className="muted">{t.loading}</p> : null}
                    {courses.status === 'error' ? <p>{t.loadError}</p> : null}
                    {courses.status === 'ok' && courseItems.length === 0 ? (
                      <p>{t.noCourses}</p>
                    ) : null}
                    <ul className="card-list">
                      {courseItems.map((course) => (
                        <li key={course.id} className="card">
                          <span className="card-code">{course.code}</span>
                          <span className="card-title">{titleFor(course, bn)}</span>
                          <span className="card-meta">
                            {[
                              course.credits !== null ? `${t.credits}: ${course.credits}` : null,
                              course.marks !== null ? `${t.marks}: ${course.marks}` : null,
                              course.classHours !== null
                                ? `${t.classHoursLabel}: ${course.classHours}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            ) : null}

            {tab === 'resources' ? (
              <div role="tabpanel" id="panel-resources" aria-labelledby="tab-resources">
                <p className="tip-note">{t.materialsSoon}</p>
              </div>
            ) : null}
          </>
        )}
      </main>
    </PageShell>
  );
}
