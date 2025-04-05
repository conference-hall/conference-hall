import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, data } from 'react-router';
import { useChangeLanguage } from 'remix-i18next/react';
import type { Route } from './+types/root.ts';
import { UserInfo } from './.server/user-registration/user-info.ts';
import { initializeFirebaseClient } from './libs/auth/firebase.ts';
import { destroySession, getUserSession } from './libs/auth/session.ts';
import { getBrowserEnv } from './libs/env/env.server.ts';
import { flags } from './libs/feature-flags/flags.server.ts';
import { i18n } from './libs/i18n/i18n.server.ts';
import { useNonce } from './libs/nonce/use-nonce.ts';
import type { Toast } from './libs/toasts/toast.server.ts';
import { getToast } from './libs/toasts/toast.server.ts';
import { Toaster } from './libs/toasts/toaster.tsx';
import { FlagsProvider } from './routes/components/contexts/flags-context.tsx';
import { UserProvider } from './routes/components/contexts/user-context.tsx';
import { GeneralErrorBoundary } from './routes/components/error-boundary.tsx';
import { GlobalLoading } from './routes/components/global-loading.tsx';
import fonts from './styles/fonts.css?url';
import tailwind from './styles/tailwind.css?url';

const ONE_DAY_IN_SECONDS = String(24 * 60 * 60);

const isMaintenanceMode = process.env.MAINTENANCE_ENABLED === 'true';

export const meta = ({ data }: Route.MetaArgs) => {
  const metatags = [
    { title: 'Conference Hall' },
    { name: 'description', content: 'Open SaaS app for call for papers.' },
  ];
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

export const loader = async ({ request }: Route.LoaderArgs) => {
  const locale = await i18n.getLocale(request);

  if (isMaintenanceMode) {
    throw new Response('Maintenance', { status: 503, headers: { 'Retry-After': ONE_DAY_IN_SECONDS } });
  }

  const { toast, headers: toastHeaders } = await getToast(request);

  const { userId } = (await getUserSession(request)) || {};
  const user = await UserInfo.get(userId);
  if (userId && !user) await destroySession(request);

  const frontendFlags = await flags.withTag('frontend');

  return data({ locale, user, toast, env: getBrowserEnv(), flags: frontendFlags }, { headers: toastHeaders || {} });
};

type DocumentProps = {
  locale: string;
  nonce: string;
  env?: Record<string, unknown>;
  toast?: Toast | null;
  children: ReactNode;
};

function Document({ locale, nonce, env = {}, toast, children }: DocumentProps) {
  const { i18n } = useTranslation();
  return (
    <html lang={locale} dir={i18n.dir()}>
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
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { locale, user, env, toast, flags } = loaderData;
  const nonce = useNonce();

  useChangeLanguage(locale);

  initializeFirebaseClient(locale, env);

  return (
    <FlagsProvider flags={flags}>
      <UserProvider user={user}>
        <Document locale={locale} toast={toast} env={env} nonce={nonce}>
          <Outlet />
        </Document>
      </UserProvider>
    </FlagsProvider>
  );
}

export function ErrorBoundary() {
  const nonce = useNonce();

  // TODO: Manage error boundary in main layouts to manage locale
  return (
    <Document locale="en" nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  );
}
