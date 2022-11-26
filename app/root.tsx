import type { ReactNode } from 'react';
import type { LinksFunction, LoaderArgs } from '@remix-run/node';
import { config } from './libs/config';
import { json } from '@remix-run/node';
import { Meta, LiveReload, Outlet, Links, Scripts, useCatch, useLoaderData, ScrollRestoration } from '@remix-run/react';
import { initializeFirebase } from './libs/auth/firebase';
import { commitSession, getSession } from './libs/auth/auth.server';
import { getUser } from './services/user/get-user.server';
import { Footer } from './components/Footer';
import { H1, Text } from './design-system/Typography';
import { Container } from './design-system/Container';
import { GlobalLoading } from './components/GlobalLoading';
import { Toast } from './design-system/Toast';
import type { ToastData } from './utils/toasts';
import { getToast } from './utils/toasts';
import tailwind from './tailwind.css';
import { listNotifications } from './services/user-notifications/list-notifications.server';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export type UserContext = {
  user: Awaited<ReturnType<typeof getUser>> | null;
  notifications: Awaited<ReturnType<typeof listNotifications>> | null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const { uid, session } = await getSession(request);
  const toast = getToast(session);

  let user = null;
  let notifications = null;
  if (uid) {
    user = await getUser(uid).catch(() => console.log('No user connected.'));
    notifications = await listNotifications(uid);
  }

  return json(
    {
      user,
      notifications,
      toast,
      firebase: {
        FIREBASE_API_KEY: config.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: config.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: config.FIREBASE_PROJECT_ID,
        FIREBASE_AUTH_EMULATOR_HOST: config.FIREBASE_AUTH_EMULATOR_HOST,
        isProduction: config.isProduction,
      },
    },
    { headers: { 'Set-Cookie': await commitSession(session) } }
  );
};

export default function App() {
  const { user, notifications, firebase, toast } = useLoaderData<typeof loader>();

  initializeFirebase(firebase);

  return (
    <Document title="Conference Hall" toast={toast}>
      <Outlet context={{ user, notifications }} />
    </Document>
  );
}

type DocumentProps = { children: ReactNode; title?: string; toast?: ToastData | null };

function Document({ children, title, toast }: DocumentProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body className="bg-white font-sans text-gray-600 antialiased">
        <GlobalLoading />
        {children}
        <Footer />
        <Scripts />
        <ScrollRestoration />
        <LiveReload />
        <Toast toast={toast} />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Container className="my-4 sm:my-8">
        <H1>
          {caught.status} {caught.statusText}
        </H1>
        <Text>{caught.data}</Text>
      </Container>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  return (
    <Document title="Oops!">
      <Container className="my-4 sm:my-8">
        <H1>App Error</H1>
        <Text>{error.message}</Text>
      </Container>
    </Document>
  );
}
