import type { SupportedLanguage } from '@ehp/shared-types';
import { STRINGS } from '../../lib/i18n';
import { BrandMark } from './BrandMark';

export function SiteHeader({
  language,
  onToggleLanguage,
}: {
  language: SupportedLanguage;
  onToggleLanguage: () => void;
}) {
  const t = STRINGS[language];
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#top">
          <BrandMark />
          <span>
            <span className="brand-name">{t.brand}</span>
            <span className="brand-tagline">{t.tagline}</span>
          </span>
        </a>

        <nav aria-label="Site" className="main-nav">
          <a href="#top" aria-current="page">
            {t.navHome}
          </a>
          <a href="#why">{t.navAbout}</a>
          <a href="#next">{t.navHelp}</a>
          <a href="#contact">{t.navContact}</a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="pill-button"
            lang={language === 'en' ? 'bn' : 'en'}
            onClick={onToggleLanguage}
          >
            {t.languageSwitch}
          </button>
          <button
            type="button"
            className="pill-button"
            disabled
            title={t.comingSoon}
            aria-label={`${t.signIn} (${t.comingSoon})`}
          >
            {t.signIn}
          </button>
        </div>
      </div>
    </header>
  );
}
