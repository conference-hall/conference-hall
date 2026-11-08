import { defineConfig } from '@x18n/core';

export default defineConfig({
  sourceLocale: 'en',
  presets: ['react-i18next', 'i18next'],
  keySeparator: false,
  resources: [{ pattern: 'app/locales/{locale}.{namespace}.json' }],
  namespace: { byFile: { 'app/shared/emails/templates/**': 'email' } },
  usage: {
    keysInUse: ['translation:error.auth.*', 'translation:error.field.*', 'translation:admin.requests.status.*'],
  },
  checks: { 'stale-translation': 'off', 'identical-to-source': 'off' },
  write: { sort: 'binary' },
});
