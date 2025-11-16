import { setLocaleCookie } from './i18n.middleware.ts';

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
