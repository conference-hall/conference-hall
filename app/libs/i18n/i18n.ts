export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

export const i18nConfig = {
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  fallbackLng: 'en',
};
