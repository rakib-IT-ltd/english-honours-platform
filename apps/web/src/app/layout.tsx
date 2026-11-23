import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';
import { AppProviders } from '../components/providers/AppProviders';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'English Honours Learning Platform',
  description: 'Bilingual academic learning platform for English Honours students in Bangladesh.',
};

// AppProviders switches the document language (English/Bangla) and tracks sign-in on the client.
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANGUAGE}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
