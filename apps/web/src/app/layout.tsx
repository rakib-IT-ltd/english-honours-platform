import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';

export const metadata: Metadata = {
  title: 'English Honours Learning Platform',
  description: 'Bilingual academic learning platform for English Honours students in Bangladesh.',
};

// Interface language handling (English/Bangla) is introduced in a later module.
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANGUAGE}>
      <body>{children}</body>
    </html>
  );
}
