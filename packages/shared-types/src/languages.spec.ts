import { describe, expect, it } from 'vitest';
import { isSupportedLanguage, SUPPORTED_LANGUAGES } from './index.js';

describe('isSupportedLanguage', () => {
  it('accepts English and Bangla', () => {
    for (const code of SUPPORTED_LANGUAGES) expect(isSupportedLanguage(code)).toBe(true);
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'bn']);
  });

  it('rejects other values', () => {
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage('EN')).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
    expect(isSupportedLanguage(42)).toBe(false);
  });
});
