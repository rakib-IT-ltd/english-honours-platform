'use client';

import { useEffect, useState } from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';
import { STRINGS } from '../../lib/i18n';
import { AcademicSelector } from '../academic/AcademicSelector';

const REPOSITORY_URL = 'https://github.com/rakib-IT-ltd/english-honours-platform';

export function HomeView() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = STRINGS[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div lang={language}>
      <header className="site-header">
        <span className="site-name">{t.siteName}</span>
        <nav aria-label="Site">
          <button
            type="button"
            className="link-button"
            lang={language === 'en' ? 'bn' : 'en'}
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          >
            {t.languageSwitch}
          </button>
          <a href={REPOSITORY_URL} rel="noopener noreferrer">
            {t.github}
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>{STRINGS.en.heroTitle}</h1>
          <p lang="bn" className="hero-bn">
            {STRINGS.bn.heroTitle}
          </p>
          <p>{t.heroText}</p>
        </section>

        <AcademicSelector language={language} />
      </main>

      <footer className="site-footer">
        <p>{t.footerVerification}</p>
      </footer>
    </div>
  );
}
