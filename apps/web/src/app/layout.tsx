import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { SupportedLanguage } from '@ehp/shared-types';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'English Honours Learning Platform',
  description: 'Bilingual academic learning platform for English Honours students in Bangladesh.',
};

// The home page switches the document language between English and Bangla on the client.
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANGUAGE}>
      <body>{children}</body>
    </html>
  );
}
