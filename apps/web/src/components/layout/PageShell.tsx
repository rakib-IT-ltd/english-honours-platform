'use client';

import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { useLanguage } from '../providers/AppProviders';

/** Header + footer around a page. Sets the language on the wrapper for screen readers. */
export function PageShell({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  return (
    <div lang={language} id="top">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
