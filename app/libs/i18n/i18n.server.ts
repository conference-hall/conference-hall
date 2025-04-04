import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { type EntryContext, createCookie } from 'react-router';
import { RemixI18Next } from 'remix-i18next/server';
import { i18nResources } from './i18n.resources.ts';
import { i18nConfig } from './i18n.ts';

const MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year

const localeCookie = createCookie('locale', {
  path: '/',
  secure: true,
  secrets: [process.env.COOKIE_SIGNED_SECRET],
  sameSite: 'lax',
});

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
