import { getWebServerEnv } from '../../../servers/environment.server.ts';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string): Promise<boolean> {
  const { CAPTCHA_SECRET_KEY } = getWebServerEnv();
  if (!CAPTCHA_SECRET_KEY) return true;

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: CAPTCHA_SECRET_KEY, response: token }),
  });

  const result = await response.json();
  return result.success === true;
}
