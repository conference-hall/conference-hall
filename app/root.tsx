import type { ReactNode } from 'react';
import type { LinksFunction, LoaderArgs } from '@remix-run/node';
import { config } from './services/config';
import { json } from '@remix-run/node';
import { Meta, LiveReload, Outlet, Links, Scripts, useCatch, useLoaderData, ScrollRestoration } from '@remix-run/react';
import { initializeFirebase } from './services/auth/firebase';
import { commitSession, getSession } from './services/auth/auth.server';
import { getUser } from './services/auth/user.server';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { H1, Text } from './design-system/Typography';
import { Container } from './design-system/Container';
import { GlobalLoading } from './components/GlobalLoading';
import { Toast } from './design-system/Toast';
import type { ToastData } from './utils/toasts';
import { getToast } from './utils/toasts';
import tailwind from './tailwind.css';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  const { uid, session } = await getSession(request);
  const user = uid ? await getUser(uid).catch(() => console.log('No user connected.')) : null;
  const toast = getToast(session);

  return json(
    {
      user,
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
  const data = useLoaderData<typeof loader>();

  initializeFirebase(data.firebase);

  return (
    <Document title="Conference Hall" user={data.user} toast={data.toast}>
      <Outlet />
    </Document>
  );
}

type DocumentProps = {
  children: ReactNode;
  title?: string;
  user?: { email?: string | null; picture?: string | null } | null;
  toast?: ToastData | null;
};

function Document({ children, title, user, toast }: DocumentProps) {
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
        <Navbar user={user} />
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
