import { ReactNode } from 'react';
import { config } from './services/config';
import {
  LinksFunction,
  LoaderFunction,
  Meta,
  LiveReload,
  Outlet,
  Links,
  Scripts,
  useCatch,
  useLoaderData,
} from 'remix';
import { Navbar } from './components/layout/Navbar';

import { initializeFirebase } from './services/firebase/init';
import tailwind from './tailwind.css';
import { Footer } from './components/layout/Footer';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export const loader: LoaderFunction = () => {
  return {
    firebase: {
      FIREBASE_API_KEY: config.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: config.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: config.FIREBASE_PROJECT_ID,
      FIREBASE_AUTH_EMULATOR_HOST: config.FIREBASE_AUTH_EMULATOR_HOST,
    },
  };
};

export default function App() {
  const data = useLoaderData();

  initializeFirebase(data.firebase);

  return (
    <Document title="Conference Hall">
      <Outlet />
    </Document>
  );
}

type DocumentProps = { children: ReactNode; title?: string };

function Document({ children, title }: DocumentProps) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body className="h-full">
        <div className="min-h-full">
          <Navbar />
          {children}
          <Footer />
        </div>
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
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
        <p>
          {caught.data}
        </p>
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
