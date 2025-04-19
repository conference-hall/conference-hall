import i18next from 'i18next';
import { i18nResources } from '~/libs/i18n/i18n.resources.ts';

// i18next instance for testing
// Returns only key names for the translation keys
const i18nTest = i18next.createInstance();
i18nTest.init({ lng: 'en', fallbackLng: 'en', resources: i18nResources });

export { i18nTest };
