import { verifyCaptcha } from './verify-captcha.server.ts';

const mockGetWebServerEnv = vi.fn();

vi.mock('../../../../servers/environment.server.ts', () => ({
  getWebServerEnv: (...args: unknown[]) => mockGetWebServerEnv(...args),
}));

describe('verifyCaptcha', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when CAPTCHA_SECRET_KEY is not configured', async () => {
    mockGetWebServerEnv.mockReturnValue({ CAPTCHA_SECRET_KEY: undefined });

    const result = await verifyCaptcha('any-token');

    expect(result).toBe(true);
  });

  it('returns true when Turnstile returns success', async () => {
    mockGetWebServerEnv.mockReturnValue({ CAPTCHA_SECRET_KEY: 'secret' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

    const result = await verifyCaptcha('valid-token');

    expect(result).toBe(true);
  });

  it('returns false when Turnstile returns failure', async () => {
    mockGetWebServerEnv.mockReturnValue({ CAPTCHA_SECRET_KEY: 'secret' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] })),
    );

    const result = await verifyCaptcha('invalid-token');

    expect(result).toBe(false);
  });
});
