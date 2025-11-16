import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { data, Links, Meta, type MetaDescriptor, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { getWebServerEnv } from '../../shared/src/environment/environment.ts';
import type { Route } from './+types/root.ts';
import { GeneralErrorBoundary } from './app-platform/components/errors/error-boundary.tsx';
import { GlobalLoading } from './app-platform/components/global-loading.tsx';
import { UserProvider } from './app-platform/components/user-context.tsx';
import { getFirebaseClientConfig } from './shared/auth/firebase.server.ts';
import { initializeFirebaseClient } from './shared/auth/firebase.ts';
import { destroySession, getUserSession } from './shared/auth/session.ts';
import { flags } from './shared/feature-flags/flags.server.ts';
import { FlagsProvider } from './shared/feature-flags/flags-context.tsx';
import { getI18n, getLocale, i18nextMiddleware, setLocaleCookie } from './shared/i18n/i18n.middleware.ts';
import { useChangeLanguage } from './shared/i18n/use-change-language.ts';
import { useNonce } from './shared/nonce/use-nonce.ts';
import type { Toast } from './shared/toasts/toast.server.ts';
import { getToast } from './shared/toasts/toast.server.ts';
import { Toaster } from './shared/toasts/toaster.tsx';
import { UserAccount } from './shared/user/user-account.server.ts';
import { combineHeaders } from './shared/utils/headers.ts';
import fonts from './styles/fonts.css?url';
import tailwind from './styles/tailwind.css?url';

const { MAINTENANCE_ENABLED } = getWebServerEnv();

const ONE_DAY_IN_SECONDS = String(24 * 60 * 60);

export const meta = ({ data }: Route.MetaArgs) => {
  const metatags: MetaDescriptor[] = [{ title: data?.title }, { name: 'description', content: data?.description }];
  const isSeoEnabled = data?.flags?.seo;
  if (!isSeoEnabled) metatags.push({ name: 'robots', content: 'noindex' });
  return metatags;
};

export const links: Route.LinksFunction = () => {
  return [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
    { rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
    { rel: 'alternate icon', type: 'image/png', href: '/favicons/favicon-32x32.png' },
    { rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest', crossOrigin: 'use-credentials' },
    { rel: 'stylesheet', href: fonts },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export const middleware = [i18nextMiddleware];

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  if (MAINTENANCE_ENABLED) {
    throw new Response('Maintenance', { status: 503, headers: { 'Retry-After': ONE_DAY_IN_SECONDS } });
  }

  const { userId } = (await getUserSession(request)) || {};
  const user = await UserAccount.get(userId);
  if (userId && !user) await destroySession(request);

  const { toast, toastHeaders } = await getToast(request);

  const frontendFlags = await flags.withTag('frontend');
  const locale = getLocale(context);
  const i18n = getI18n(context);
  const title = i18n.t('app.title');
  const description = i18n.t('app.description');
  const firebaseConfig = getFirebaseClientConfig();

  return data(
    { title, description, user, locale, toast, firebaseConfig, flags: frontendFlags },
    { headers: combineHeaders(toastHeaders, await setLocaleCookie(locale)) },
  );
};

type DocumentProps = { nonce: string; toast?: Toast | null; children: ReactNode };

function Document({ nonce, toast, children }: DocumentProps) {
  const { i18n } = useTranslation();

  return (
    <html lang={i18n.language} dir={i18n.dir(i18n.language)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden bg-slate-50 font-sans text-gray-900 antialiased">
        <GlobalLoading />
        <Toaster toast={toast} />
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { locale, user, firebaseConfig, toast, flags } = loaderData;
  const nonce = useNonce();

  useChangeLanguage(locale);

  initializeFirebaseClient(locale, firebaseConfig);

  return (
    <FlagsProvider flags={flags}>
      <UserProvider user={user}>
        <Document toast={toast} nonce={nonce}>
          <Outlet />
        </Document>
      </UserProvider>
    </FlagsProvider>
  );
}

export function ErrorBoundary() {
  const nonce = useNonce();

  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  );
}
