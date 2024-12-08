import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, data } from 'react-router';
import type { Route } from './+types/root.ts';
import { UserInfo } from './.server/user-registration/user-info.ts';
import { initializeFirebaseClient } from './libs/auth/firebase.ts';
import { destroySession, getSessionUserId } from './libs/auth/session.ts';
import { getPublicEnv } from './libs/env/env.server.ts';
import { flags } from './libs/feature-flags/flags.server.ts';
import { useNonce } from './libs/nonce/use-nonce.ts';
import type { Toast } from './libs/toasts/toast.server';
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
    { charset: 'utf-8' },
    { title: 'Conference Hall' },
    { name: 'description', content: 'Open SaaS app for call for papers.' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
  ];

  const isSeoEnabled = data.flags.seo;
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
  if (isMaintenanceMode) {
    throw new Response('Maintenance', { status: 503, headers: { 'Retry-After': ONE_DAY_IN_SECONDS } });
  }

  const { toast, headers: toastHeaders } = await getToast(request);

  const userId = await getSessionUserId(request);
  const user = await UserInfo.get(userId);
  if (userId && !user) await destroySession(request);

  const frontendFlags = await flags.withTag('frontend');

  return data({ user, toast, env: getPublicEnv(), flags: frontendFlags }, { headers: toastHeaders || {} });
};

type DocumentProps = { children: ReactNode; toast?: Toast | null; nonce: string; env?: Record<string, unknown> };

function Document({ children, toast, nonce, env = {} }: DocumentProps) {
  return (
    <html lang="en">
      <head>
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
  const { user, env, toast, flags } = loaderData;
  const nonce = useNonce();

  initializeFirebaseClient(env);

  return (
    <FlagsProvider flags={flags}>
      <UserProvider user={user}>
        <Document toast={toast} env={env} nonce={nonce}>
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
