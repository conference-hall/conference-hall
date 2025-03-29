import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { type EntryContext, createCookie } from 'react-router';
import { RemixI18Next } from 'remix-i18next/server';
import en from '../../../public/locales/en/translation.json' with { type: 'json' };
import fr from '../../../public/locales/fr/translation.json' with { type: 'json' };
import { i18nConfig } from './i18n.ts';

const MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year

const localeCookie = createCookie('locale', {
  path: '/',
  httpOnly: true,
  secure: true,
  secrets: [process.env.COOKIE_SIGNED_SECRET],
  sameSite: 'lax', // todo(i18n): 'strict' or 'lax'? 'strict' is not supported in Safari?
});

// todo(i18n)
// - Email locale configuration
// - Display dates according the locale
// - Use a feature flag to disabled french locale for now
// - How to enable cimode (display key only)

export const i18nResources = {
  en: { translation: en },
  fr: { translation: fr },
};

export const i18n = new RemixI18Next({
  detection: {
    supportedLanguages: i18nConfig.supportedLngs,
    fallbackLanguage: i18nConfig.fallbackLng,
    order: ['cookie', 'header'],
    cookie: localeCookie,
  },
  i18next: { ...i18nConfig, resources: i18nResources },
});

export async function initializeI18n(request: Request, context: EntryContext) {
  const instance = createInstance();

  // The detected locale
  const lng = await i18n.getLocale(request);

  // The namespaces the routes about to render wants to use
  const ns = i18n.getRouteNamespaces(context);

  await instance.use(initReactI18next).init({ ...i18nConfig, lng, ns, resources: i18nResources });
  return instance;
}

export async function setLocaleCookie(locale: string) {
  return { 'set-cookie': await localeCookie.serialize(locale, { maxAge: MAX_AGE_SEC }) };
}
