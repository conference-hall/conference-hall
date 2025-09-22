import { isSupportedLanguage, SUPPORTED_LANGUAGES } from './i18n.ts';

describe('isSupportedLanguage', () => {
  it.each(SUPPORTED_LANGUAGES)('returns true for supported language: %s', (language) => {
    expect(isSupportedLanguage(language)).toBe(true);
  });

  it.each(['es', 'de', 'it', 'pt', 'ja'])('returns false for unsupported language: %s', (language) => {
    expect(isSupportedLanguage(language)).toBe(false);
  });

  it('returns false for invalid inputs', () => {
    expect(isSupportedLanguage('')).toBe(false);
    expect(isSupportedLanguage('123')).toBe(false);
    expect(isSupportedLanguage('EN')).toBe(false);
    expect(isSupportedLanguage('FR')).toBe(false);
  });
});
