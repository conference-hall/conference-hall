import { getLocaleFromRequest, setLocaleCookie } from './i18n.middleware.ts';

describe('setLocaleCookie', () => {
  it('returns a cookie header with set-cookie key', async () => {
    const result = await setLocaleCookie('en');

    expect(result).toHaveProperty('set-cookie');
    expect(typeof result['set-cookie']).toBe('string');
    expect(result['set-cookie']).toContain('locale=');
    expect(result['set-cookie']).toContain('Max-Age=');
    expect(result['set-cookie']).toContain('SameSite=Lax');
    expect(result['set-cookie']).toContain('Secure');
    expect(result['set-cookie']).toContain('Path=/');
  });
});

describe('getLocaleFromRequest', () => {
  it('returns fallback language when no request is provided', async () => {
    const locale = await getLocaleFromRequest();

    expect(locale).toBe('en');
  });

  it('returns fallback language when request has no cookie header', async () => {
    const request = new Request('http://localhost');

    const locale = await getLocaleFromRequest(request);

    expect(locale).toBe('en');
  });

  it('returns locale from a valid signed cookie', async () => {
    const cookie = await setLocaleCookie('fr');
    const request = new Request('http://localhost', {
      headers: { cookie: cookie['set-cookie'] },
    });

    const locale = await getLocaleFromRequest(request);

    expect(locale).toBe('fr');
  });

  it('returns fallback language when cookie has invalid signature', async () => {
    const request = new Request('http://localhost', {
      headers: { cookie: 'locale=tampered-value' },
    });

    const locale = await getLocaleFromRequest(request);

    expect(locale).toBe('en');
  });
});
