import { getEmailI18n } from './i18n.emails.ts';
import { SUPPORTED_LANGUAGES } from './i18n.ts';

describe('getEmailI18n', () => {
  it.each(SUPPORTED_LANGUAGES)('returns a translation function for locale: %s', (locale) => {
    const t = getEmailI18n(locale);

    expect(typeof t).toBe('function');
    expect(() => t('common.by')).not.toThrow();
  });

  it('returned function accepts translation keys', () => {
    const t = getEmailI18n('en');

    expect(() => t('common.by')).not.toThrow();
  });
});
