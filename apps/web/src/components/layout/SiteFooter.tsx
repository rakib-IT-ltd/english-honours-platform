'use client';

import Link from 'next/link';
import { STRINGS } from '../../lib/i18n';
import { useLanguage } from '../providers/AppProviders';
import { BrandMark } from './BrandMark';

const REPOSITORY_URL = 'https://github.com/rakib-IT-ltd/english-honours-platform';

export function SiteFooter() {
  const { language } = useLanguage();
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
          <Link href="/">{t.navHome}</Link>
          <Link href="/#why">{t.navAbout}</Link>
          <Link href="/#next">{t.navHelp}</Link>
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
