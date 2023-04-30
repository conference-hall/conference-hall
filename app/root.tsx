import type { ReactNode } from 'react';
import type { LinksFunction, LoaderArgs } from '@remix-run/node';
import { config } from './libs/config';
import { json } from '@remix-run/node';
import {
  Meta,
  LiveReload,
  Outlet,
  Links,
  Scripts,
  useLoaderData,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
  useOutletContext,
} from '@remix-run/react';
import type { User } from './shared-server/users/get-user.server';
import { getUser } from './shared-server/users/get-user.server';
import { H1, Text } from './design-system/Typography';
import { GlobalLoading } from './shared-components/GlobalLoading';
import { Toast } from './libs/toasts/Toast';
import tailwind from './tailwind.css';
import { Container } from './design-system/layouts/Container';
import { initializeFirebaseClient } from './libs/auth/firebase';
import { getSessionUserId } from './libs/auth/session';
import type { ToastData } from './libs/toasts/toasts';
import { commitToastSession, getToastSession } from './libs/toasts/toasts';

export function meta() {
  return [
    { charset: 'utf-8' },
    { title: 'Conference Hall' },
    { viewport: 'width=device-width,initial-scale=1' },
    { name: 'robots', content: 'noindex' },
  ];
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://fonts.cdnfonts.com/css/inter' },
    { rel: 'stylesheet', href: 'https://fonts.cdnfonts.com/css/ubuntu' },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  const toast = await getToastSession(request);

  const userId = await getSessionUserId(request);
  const user = await getUser(userId);

  return json(
    {
      user,
      toast: toast.get('message'),
      firebase: {
        FIREBASE_API_KEY: config.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: config.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: config.FIREBASE_PROJECT_ID,
        FIREBASE_AUTH_EMULATOR_HOST: config.FIREBASE_AUTH_EMULATOR_HOST,
        useFirebaseEmulators: config.useEmulators,
      },
    },
    { headers: { 'Set-Cookie': await commitToastSession(toast) } }
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
        <Scripts />
        <ScrollRestoration />
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
