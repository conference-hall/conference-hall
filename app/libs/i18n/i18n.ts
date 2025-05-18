// todo(i18n): add supported languages
export const SUPPORTED_LANGUAGES = ['en'] as const;

export const i18nConfig = {
  supportedLngs: [...SUPPORTED_LANGUAGES],
  fallbackLng: 'en',
};
