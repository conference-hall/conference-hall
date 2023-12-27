import './styles/tailwind.css';
import './styles/fonts.css';

import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { withSentry } from '@sentry/remix';
import type { ReactNode } from 'react';

import { UserInfo } from './.server/user-registration/UserInfo';
import { Container } from './design-system/layouts/Container';
import { H1, Text } from './design-system/Typography';
import { initializeFirebaseClient } from './libs/auth/firebase';
import { getSessionUserId } from './libs/auth/session';
import { getPublicEnv } from './libs/env/env.server.ts';
import { useNonce } from './libs/nonce/useNonce';
import type { Toast } from './libs/toasts/toast.server';
import { getToast } from './libs/toasts/toast.server';
import { Toaster } from './libs/toasts/Toaster';
import { GlobalLoading } from './routes/__components/GlobalLoading';

export function meta() {
  return [
    { charset: 'utf-8' },
    { title: 'Conference Hall' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { name: 'robots', content: 'noindex' },
  ];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers: toastHeaders } = await getToast(request);

  const userId = await getSessionUserId(request);
  const user = await UserInfo.get(userId);

  return json({ user, toast, env: getPublicEnv() }, { headers: toastHeaders || {} });
};

function App() {
  const { user, env, toast } = useLoaderData<typeof loader>();

  initializeFirebaseClient(env);

  return (
    <Document toast={toast} env={env}>
      <Outlet context={{ user }} />
    </Document>
  );
}

export default withSentry(App);

type DocumentProps = { children: ReactNode; toast?: Toast | null; env?: Record<string, unknown> };

function Document({ children, toast, env = {} }: DocumentProps) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden bg-slate-50 font-sans text-gray-900 antialiased">
        <GlobalLoading />
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <LiveReload nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster toast={toast} />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document>
        <Container className="my-4 sm:my-8">
          <H1>{error.status}</H1>
          <Text>{error.data}</Text>
        </Container>
      </Document>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  return (
    <Document>
      <Container className="my-4 sm:my-8">
        <H1>Something went wrong.</H1>
      </Container>
    </Document>
  );
}
