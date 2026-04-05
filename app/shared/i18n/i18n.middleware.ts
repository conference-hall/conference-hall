import { createCookie } from 'react-router';
import { createI18nextMiddleware } from 'remix-i18next/middleware';
import { getWebServerEnv } from '../../../servers/environment.server.ts';
import { i18nResources } from './i18n.resources.ts';
import { FALLBACK_LANGUAGE, i18nConfig, SUPPORTED_LANGUAGES } from './i18n.ts';

const { COOKIE_SIGNED_SECRET } = getWebServerEnv();

const MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year

const localeCookie = createCookie('locale', {
  path: '/',
  secure: true,
  secrets: [COOKIE_SIGNED_SECRET],
  sameSite: 'lax',
});

export const [i18nextMiddleware, getLocale, getI18n] = createI18nextMiddleware({
  detection: {
    supportedLanguages: [...SUPPORTED_LANGUAGES],
    fallbackLanguage: FALLBACK_LANGUAGE,
    order: ['cookie', 'header'],
    cookie: localeCookie,
  },
  i18next: { ...i18nConfig, resources: i18nResources },
});

export async function setLocaleCookie(locale: string) {
  return { 'set-cookie': await localeCookie.serialize(locale, { maxAge: MAX_AGE_SEC }) };
}

export async function getLocaleFromRequest(request?: Request): Promise<string> {
  if (!request) return FALLBACK_LANGUAGE;
  const headers = request.headers;
  const cookieHeader = headers.get('cookie');
  const cookieValue = await localeCookie.parse(cookieHeader);
  return cookieValue || FALLBACK_LANGUAGE;
}
