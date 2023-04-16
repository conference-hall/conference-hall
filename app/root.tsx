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
import { initializeFirebase } from './libs/auth/firebase';
import { commitSession, getSession } from './libs/auth/auth.server';
import type { User } from './shared-server/users/get-user.server';
import { getUser } from './shared-server/users/get-user.server';
import { H1, Text } from './design-system/Typography';
import { GlobalLoading } from './shared-components/GlobalLoading';
import { Toast } from './design-system/Toast';
import type { ToastData } from './libs/toasts/toasts';
import { getToast } from './libs/toasts/toasts';
import tailwind from './tailwind.css';
import { Container } from './design-system/layouts/Container';

export function meta() {
  return [{ charset: 'utf-8' }, { title: 'Conference Hall' }, { viewport: 'width=device-width,initial-scale=1' }];
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://fonts.cdnfonts.com/css/inter' },
    { rel: 'stylesheet', href: 'https://fonts.cdnfonts.com/css/ubuntu' },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  const { uid, session } = await getSession(request);

  const toast = getToast(session);

  const user = await getUser(uid);

  return json(
    {
      user,
      toast,
      firebase: {
        FIREBASE_API_KEY: config.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: config.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: config.FIREBASE_PROJECT_ID,
        FIREBASE_AUTH_EMULATOR_HOST: config.FIREBASE_AUTH_EMULATOR_HOST,
        useFirebaseEmulators: config.useEmulators,
      },
    },
    { headers: { 'Set-Cookie': await commitSession(session) } }
  );
};

export default function App() {
  const { user, firebase, toast } = useLoaderData<typeof loader>();

  initializeFirebase(firebase);

  return (
    <Document toast={toast}>
      <Outlet context={{ user }} />
    </Document>
  );
}

export function useUser() {
  return useOutletContext<{ user: User }>();
}

type DocumentProps = { children: ReactNode; toast?: ToastData | null };

function Document({ children, toast }: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden bg-gray-100 text-gray-900 antialiased">
        <GlobalLoading />
        {children}
        <Scripts />
        <ScrollRestoration />
        <LiveReload />
        <Toast toast={toast} />
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
