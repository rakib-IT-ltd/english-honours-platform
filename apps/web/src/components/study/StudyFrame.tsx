'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { STUDY_TEXT } from '../../lib/studyText';
import { studyHref, studyResourceHref } from '../../lib/routes';
import { useLanguage } from '../providers/AppProviders';
import { StudyIcon } from './icons';

/** Navy header + clean white reading area + bottom navigation, shared by the study screens. */
export function StudyFrame({
  bookId,
  active,
  header,
  children,
}: {
  bookId: string;
  active: 'home' | 'reading' | 'notes' | null;
  header: ReactNode;
  children: ReactNode;
}) {
  const { language, toggleLanguage } = useLanguage();
  const t = STUDY_TEXT[language];
  return (
    <div className="study-app" lang={language}>
      <header className="study-header">
        <div className="study-topbar">
          <Link href="/" className="study-brand">
            <span className="study-brand-mark" aria-hidden="true">
              <StudyIcon name="ORIGINAL_TEXT" size={18} />
            </span>
            <span>
              <strong>ENGLISH HONOURS</strong>
              <small>LEARN · UNDERSTAND · EXCEL</small>
            </span>
          </Link>
          <button type="button" className="study-lang" onClick={toggleLanguage}>
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
          <Link href="/" className="study-home" aria-label={t.home}>
            <StudyIcon name="HOME" />
          </Link>
        </div>
        {header}
      </header>
      <main className="study-main">{children}</main>
      <nav className="study-nav" aria-label={t.studyCentre}>
        <Link href="/" aria-current={active === 'home' ? 'page' : undefined}>
          <StudyIcon name="HOME" />
          <span>{t.home}</span>
        </Link>
        <Link href={studyHref(bookId)} aria-current={active === 'reading' ? 'page' : undefined}>
          <StudyIcon name="ORIGINAL_TEXT" />
          <span>{t.reading}</span>
        </Link>
        <Link
          href={studyResourceHref(bookId, 'notes')}
          aria-current={active === 'notes' ? 'page' : undefined}
        >
          <StudyIcon name="NOTES" />
          <span>{t.myNotes}</span>
        </Link>
      </nav>
    </div>
  );
}
