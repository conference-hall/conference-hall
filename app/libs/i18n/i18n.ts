export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

export const i18nConfig = {
  supportedLngs: [...SUPPORTED_LANGUAGES],
  fallbackLng: 'en',
};

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(locale: string): locale is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(locale as SupportedLanguage);
}
