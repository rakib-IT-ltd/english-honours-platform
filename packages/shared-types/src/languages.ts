/** Content languages supported by the platform. English and Bangla are both first-class. */
export const SUPPORTED_LANGUAGES = ['en', 'bn'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
