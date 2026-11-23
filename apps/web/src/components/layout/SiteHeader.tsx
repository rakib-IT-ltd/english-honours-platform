'use client';

import Link from 'next/link';
import { STRINGS } from '../../lib/i18n';
import { useAuth, useLanguage } from '../providers/AppProviders';
import { BrandMark } from './BrandMark';

export function SiteHeader() {
  const { language, toggleLanguage } = useLanguage();
  const { status, user, signOut } = useAuth();
  const t = STRINGS[language];

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <BrandMark />
          <span>
            <span className="brand-name">{t.brand}</span>
            <span className="brand-tagline">{t.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Site" className="main-nav">
          <Link href="/" aria-current="page">
            {t.navHome}
          </Link>
          <Link href="/#why">{t.navAbout}</Link>
          <Link href="/#next">{t.navHelp}</Link>
          <Link href="/#contact">{t.navContact}</Link>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="pill-button"
            lang={language === 'en' ? 'bn' : 'en'}
            onClick={toggleLanguage}
          >
            {t.languageSwitch}
          </button>

          {status === 'signedIn' ? (
            <>
              <Link className="pill-button" href="/profile" title={user?.email ?? undefined}>
                {t.myProfile}
              </Link>
              <button type="button" className="pill-button" onClick={() => void signOut()}>
                {t.signOut}
              </button>
            </>
          ) : status === 'signedOut' ? (
            <Link className="pill-button" href="/login">
              {t.signIn}
            </Link>
          ) : (
            <button
              type="button"
              className="pill-button"
              disabled
              title={status === 'disabled' ? t.authNotConfigured : t.working}
              aria-label={`${t.signIn} (${status === 'disabled' ? t.comingSoon : t.working})`}
            >
              {t.signIn}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
