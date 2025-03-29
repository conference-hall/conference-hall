import type { i18nResources } from './i18n.server.ts';

const defaultNS = 'translation';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof i18nResources)['en'];
  }
}
