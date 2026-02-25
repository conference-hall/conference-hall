import { getWebServerEnv } from '../../../servers/environment.server.ts';
import { flags } from '../feature-flags/flags.server.ts';
import { logger } from '../logger/logger.server.ts';

const { CAPTCHA_SECRET_KEY, CAPTCHA_SITE_KEY } = getWebServerEnv();

interface CaptchaValidationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

export async function validateCaptchaToken(token = ''): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: CAPTCHA_SECRET_KEY, response: token }),
    });

    if (!response.ok) {
      logger.error('Captcha validation failed', { status: response.status });
      return false;
    }

    const data = (await response.json()) as CaptchaValidationResponse;
    return data.success;
  } catch (error) {
    logger.error('Captcha validation error', { error });
    return false;
  }
}

export async function getCaptchaSiteKey() {
  const isCaptchaEnabled = await flags.get('captcha');
  if (!isCaptchaEnabled) return null;
  if (!CAPTCHA_SITE_KEY) return null;
  return CAPTCHA_SITE_KEY;
}
