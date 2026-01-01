import { getWebServerEnv } from 'servers/environment.server.ts';
import { flags } from '../feature-flags/flags.server.ts';
import { getCaptchaSiteKey, validateCaptchaToken } from './captcha.server.ts';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('captcha.server', () => {
  beforeEach(async () => {
    await flags.set('captcha', false);
  });

  describe('validateCaptchaToken', () => {
    it('returns false for empty token', async () => {
      const result = await validateCaptchaToken('');
      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns false for undefined token', async () => {
      const result = await validateCaptchaToken();
      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('validates token with Cloudflare Turnstile API successfully', async () => {
      const mockResponse = { success: true };
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

      const result = await validateCaptchaToken('valid-token');

      expect(result).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: getWebServerEnv().CAPTCHA_SECRET_KEY,
          response: 'valid-token',
        }),
      });
    });

    it('returns false when Cloudflare API returns success: false', async () => {
      const mockResponse = {
        success: false,
        'error-codes': ['invalid-input-response'],
      };
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

      const result = await validateCaptchaToken('invalid-token');

      expect(result).toBe(false);
    });

    it('returns false when API request fails with non-ok status', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await validateCaptchaToken('some-token');

      expect(result).toBe(false);
    });

    it('returns false when API request throws network error', async () => {
      const networkError = new Error('Network failure');
      fetchMock.mockRejectedValueOnce(networkError);

      const result = await validateCaptchaToken('some-token');

      expect(result).toBe(false);
    });

    it('handles malformed JSON response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await validateCaptchaToken('some-token');

      expect(result).toBe(false);
    });

    it('sends correct request body with token', async () => {
      const mockResponse = { success: true };
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

      await validateCaptchaToken('test-token-123');

      const callArgs = fetchMock.mock.calls[0];
      const bodyData = JSON.parse(callArgs[1].body);

      expect(bodyData.response).toBe('test-token-123');
      expect(bodyData.secret).toBe(getWebServerEnv().CAPTCHA_SECRET_KEY);
    });
  });

  describe('getCaptchaSiteKey', () => {
    it('returns null when captcha feature flag is disabled', async () => {
      await flags.set('captcha', false);

      const result = await getCaptchaSiteKey();

      expect(result).toBeNull();
    });

    it('returns site key when captcha feature flag is enabled and site key is configured', async () => {
      await flags.set('captcha', true);

      const result = await getCaptchaSiteKey();

      expect(result).toBe(getWebServerEnv().CAPTCHA_SITE_KEY);
    });
  });
});
