import type { ReactNode } from 'react';

const PATHS: Record<string, ReactNode> = {
  ORIGINAL_TEXT: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
    </>
  ),
  BANGLA_EXPLANATION: (
    <>
      <path d="M4 6h9M8.5 4v2M6 6c.6 3 2.4 5.4 5 7M12 6c-.7 3.2-3 5.8-6.5 7.5" />
      <path d="m13 20 3.5-8L20 20M14.3 17h4.4" />
    </>
  ),
  SUMMARY: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  CRITICAL_ANALYSIS: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2M9 11h4M11 9v4" />
    </>
  ),
  QUOTATION: (
    <>
      <path d="M7 17c-2 0-3-1.2-3-3 0-3 1.6-5.5 4-6.5M16 17c-2 0-3-1.2-3-3 0-3 1.6-5.5 4-6.5" />
    </>
  ),
  QUESTION_ANSWER: (
    <>
      <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4" />
    </>
  ),
  VOCABULARY: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9 16l3-8 3 8M10 13.5h4" />
    </>
  ),
  NOTES: (
    <>
      <path d="M6 4h9l3 3v13H6z" />
      <path d="M9 11h6M9 15h4" />
    </>
  ),
  CENTRAL_IDEA: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  HOME: <path d="m4 11 8-7 8 7M6 10v10h12V10" />,
  BOOKMARK: <path d="M7 4h10v16l-5-4-5 4z" />,
  CHEVRON: <path d="m9 6 6 6-6 6" />,
  PENCIL: <path d="m5 19 1-4 9-9 3 3-9 9zM14 7l3 3" />,
};

export function StudyIcon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
