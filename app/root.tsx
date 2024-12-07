import type { ReactNode } from 'react';
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, data, useLoaderData } from 'react-router';

import { UserInfo } from './.server/user-registration/user-info.ts';
import { initializeFirebaseClient } from './libs/auth/firebase.ts';
import { destroySession, getSessionUserId } from './libs/auth/session.ts';
import { getPublicEnv } from './libs/env/env.server.ts';
import { flags } from './libs/feature-flags/flags.server.ts';
import { useNonce } from './libs/nonce/use-nonce.ts';
import type { Toast } from './libs/toasts/toast.server';
import { getToast } from './libs/toasts/toast.server.ts';
import { Toaster } from './libs/toasts/toaster.tsx';
import { FlagsProvider } from './routes/__components/contexts/flags-context.tsx';
import { UserProvider } from './routes/__components/contexts/user-context.tsx';
import { GeneralErrorBoundary } from './routes/__components/error-boundary.tsx';
import { GlobalLoading } from './routes/__components/global-loading.tsx';
import fonts from './styles/fonts.css?url';
import tailwind from './styles/tailwind.css?url';

const ONE_DAY_IN_SECONDS = String(24 * 60 * 60);

const isMaintenanceMode = process.env.MAINTENANCE_ENABLED === 'true';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const metatags = [
    { charset: 'utf-8' },
    { title: 'Conference Hall' },
    {
      name: 'description',
      content:
        'Open SaaS for managing call for papers, speaker submissions, and event organization with automated workflows, reviews, and team collaboration.',
    },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
  ];

  const isSeoEnabled = data?.flags.seo;
  if (!isSeoEnabled) metatags.push({ name: 'robots', content: 'noindex' });

  return metatags;
};

export const links: LinksFunction = () => {
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

function App() {
  const { user, env, toast, flags } = useLoaderData<typeof loader>();
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

export default App;
