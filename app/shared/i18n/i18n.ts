import type { InitOptions } from 'i18next';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export const FALLBACK_LANGUAGE = 'en';

export const i18nConfig: InitOptions = {
  supportedLngs: [...SUPPORTED_LANGUAGES],
  fallbackLng: FALLBACK_LANGUAGE,
  showSupportNotice: false,
};

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(locale: string): locale is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(locale as SupportedLanguage);
}
