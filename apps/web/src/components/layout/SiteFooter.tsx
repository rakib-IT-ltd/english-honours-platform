import type { SupportedLanguage } from '@ehp/shared-types';
import { STRINGS } from '../../lib/i18n';
import { BrandMark } from './BrandMark';

const REPOSITORY_URL = 'https://github.com/rakib-IT-ltd/english-honours-platform';

export function SiteFooter({ language }: { language: SupportedLanguage }) {
  const t = STRINGS[language];
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner">
        <div className="brand">
          <BrandMark size={40} />
          <span>
            <span className="brand-name">{t.brand}</span>
            <span className="brand-tagline">{t.tagline}</span>
          </span>
        </div>
        <nav aria-label="Footer" className="footer-nav">
          <a href="#top">{t.navHome}</a>
          <a href="#why">{t.navAbout}</a>
          <a href="#next">{t.navHelp}</a>
          <a href={REPOSITORY_URL} rel="noopener noreferrer">
            {t.github}
          </a>
        </nav>
        <p className="footer-tagline">{t.footerTagline}</p>
      </div>
      <p className="footer-note">{t.footerVerification}</p>
    </footer>
  );
}
