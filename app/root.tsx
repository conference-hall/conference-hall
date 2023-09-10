import type { LinksFunction, LoaderArgs } from '@remix-run/node';
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
  useOutletContext,
  useRouteError,
} from '@remix-run/react';
import type { ReactNode } from 'react';

import { Container } from './design-system/layouts/Container';
import { H1, Text } from './design-system/Typography';
import { initializeFirebaseClient } from './libs/auth/firebase';
import { getSessionUserId } from './libs/auth/session';
import { config } from './libs/config';
import { Toast } from './libs/toasts/Toast';
import type { ToastData } from './libs/toasts/toasts';
import { commitToastSession, getToastSession } from './libs/toasts/toasts';
import { GlobalLoading } from './routes/__components/GlobalLoading';
import type { User } from './routes/__server/users/get-user.server';
import { getUser } from './routes/__server/users/get-user.server';
import tailwind from './tailwind.css';

export function meta() {
  return [
    { charset: 'utf-8' },
    { title: 'Conference Hall' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { name: 'robots', content: 'noindex' },
  ];
}

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwind }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const toast = await getToastSession(request);

  const userId = await getSessionUserId(request);
  const user = await getUser(userId);

  return json(
    {
      user,
      toast: toast.get('message') as ToastData,
      firebase: {
        FIREBASE_API_KEY: config.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: config.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: config.FIREBASE_PROJECT_ID,
        FIREBASE_AUTH_EMULATOR_HOST: config.FIREBASE_AUTH_EMULATOR_HOST,
        useFirebaseEmulators: config.useEmulators,
      },
    },
    { headers: { 'Set-Cookie': await commitToastSession(toast) } },
  );
};

export default function App() {
  const { user, firebase, toast } = useLoaderData<typeof loader>();

  initializeFirebaseClient(firebase);

  return (
    <Document toast={toast}>
      <Outlet context={{ user }} />
    </Document>
  );
}

export function useUser() {
  return useOutletContext<{ user: User }>();
}

type DocumentProps = { children: ReactNode; toast?: ToastData };

function Document({ children, toast }: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden bg-gray-50 font-sans text-gray-900 antialiased">
        <GlobalLoading />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {toast && <Toast toast={toast} />}
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
