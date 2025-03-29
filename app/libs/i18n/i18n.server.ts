import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { type EntryContext, createCookie } from 'react-router';
import { RemixI18Next } from 'remix-i18next/server';
import { i18nConfig } from './i18n.ts';

import en from '../../../public/locales/en/translation.json' with { type: 'json' };
import fr from '../../../public/locales/fr/translation.json' with { type: 'json' };

export const localeCookie = createCookie('locale', { path: '/', sameSite: 'lax' });

export const i18n = new RemixI18Next({
  // Language detection configuration for the server-side
  detection: {
    supportedLanguages: i18nConfig.supportedLngs,
    fallbackLanguage: i18nConfig.fallbackLng,
    order: ['cookie', 'header'],
    cookie: localeCookie,
  },
  // Configuration for i18next used when translating messages server-side only
  i18next: {
    ...i18nConfig,
    resources: { en: { translation: en }, fr: { translation: fr } },
  },
});

export async function initializeI18n(request: Request, context: EntryContext) {
  const instance = createInstance();
  const lng = await i18n.getLocale(request); // The locale we detected
  const ns = i18n.getRouteNamespaces(context); // The namespaces the routes about to render wants to use

  await instance.use(initReactI18next).init({
    ...i18nConfig,
    lng,
    ns,
    resources: { en: { translation: en }, fr: { translation: fr } },
  });

  return instance;
}
