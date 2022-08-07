import type { ReactNode } from 'react';
import { config } from './services/config';
import type { LinksFunction, LoaderArgs } from '@remix-run/node';
import { Meta, LiveReload, Outlet, Links, Scripts, useCatch, useLoaderData, ScrollRestoration } from '@remix-run/react';

import { initializeFirebase } from './services/auth/firebase';
import { isSessionValid } from './services/auth/auth.server';
import { getUser } from './services/auth/user.server';

import tailwind from './tailwind.css';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  const uid = await isSessionValid(request);
  const user = uid ? await getUser(uid).catch() : null;
  return {
    user,
    firebase: {
      FIREBASE_API_KEY: config.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: config.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: config.FIREBASE_PROJECT_ID,
      FIREBASE_AUTH_EMULATOR_HOST: config.FIREBASE_AUTH_EMULATOR_HOST,
    },
  };
};

export default function App() {
  const data = useLoaderData<typeof loader>();

  initializeFirebase(data.firebase);

  return (
    <Document title="Conference Hall" user={data.user}>
      <Outlet />
    </Document>
  );
}

type DocumentProps = {
  children: ReactNode;
  title?: string;
  user?: { email: string | null; picture: string | null } | null;
};

function Document({ children, title, user }: DocumentProps) {
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
        <Navbar user={user} />
        {children}
        <Footer />
        <Scripts />
        <ScrollRestoration />
        <LiveReload />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        <p>{caught.data}</p>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  return (
    <Document title="Uh-oh!">
      <div>
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
