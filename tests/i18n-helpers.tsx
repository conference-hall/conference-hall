import i18next from 'i18next';
import { i18nResources } from '~/shared/i18n/i18n.resources.ts';

// i18next instance for testing
// Returns 'en' language for the translation keys
const i18nTest = i18next.createInstance();
i18nTest.init({ lng: 'en', fallbackLng: 'en', resources: i18nResources, showSupportNotice: false });

export { i18nTest };
