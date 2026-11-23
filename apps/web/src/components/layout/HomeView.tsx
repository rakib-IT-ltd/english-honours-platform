'use client';

import { useEffect, useState } from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';
import { STRINGS } from '../../lib/i18n';
import { AcademicSelector } from '../academic/AcademicSelector';
import { HeroIllustration } from './HeroIllustration';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function HomeView() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = STRINGS[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div lang={language} id="top">
      <SiteHeader
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      />

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-badge">{t.heroBadge}</span>
              <h1>{STRINGS.en.heroTitle}</h1>
              <p lang="bn" className="hero-bn">
                {STRINGS.bn.heroTitle}
              </p>
              <p className="hero-text">{t.heroText}</p>
              <ul className="hero-points">
                {t.heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <HeroIllustration />
          </div>
        </section>

        <AcademicSelector language={language} />

        <section className="next" id="next" aria-labelledby="next-title">
          <div className="next-inner">
            <div>
              <h2 id="next-title">{t.nextTitle}</h2>
              <p>{t.nextText}</p>
            </div>
            <p className="next-note">{t.nextNote}</p>
          </div>
        </section>

        <section className="why" id="why" aria-labelledby="why-title">
          <h2 id="why-title">{t.whyTitle}</h2>
          <ul className="why-grid">
            {t.whyItems.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.soon ? <span className="soon">{t.comingSoon}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter language={language} />
    </div>
  );
}
