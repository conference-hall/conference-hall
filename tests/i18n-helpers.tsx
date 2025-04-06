import i18next from 'i18next';

// i18next instance for testing
// Returns only key names for the translation keys
const i18nTest = i18next.createInstance();
i18nTest.init({ lng: 'en', fallbackLng: 'en', resources: { en: {} } });

export { i18nTest };
