import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
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

import { Container } from './design-system/layouts/Container.tsx';
import { H1, Text } from './design-system/Typography.tsx';
import { initializeFirebaseClient } from './libs/auth/firebase.ts';
import { getSessionUserId } from './libs/auth/session.ts';
import { config } from './libs/config.ts';
import type { Toast } from './libs/toasts/toast.server.ts';
import { getToast } from './libs/toasts/toast.server.ts';
import { Toaster } from './libs/toasts/Toaster.tsx';
import { GlobalLoading } from './routes/__components/GlobalLoading.tsx';
import type { User } from './routes/__server/users/get-user.server.ts';
import { getUser } from './routes/__server/users/get-user.server.ts';
import fontsCssUrl from './styles/fonts.css?url';
import tailwindCssUrl from './styles/tailwind.css?url';
import { useNonce } from './utils/useNonce.ts';

export function meta() {
  return [
    { charset: 'utf-8' },
    { title: 'Conference Hall' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { name: 'robots', content: 'noindex' },
  ];
}

export const links: LinksFunction = () => {
  return [
    // Preload to avoid render blocking
    { rel: 'preload', href: fontsCssUrl, as: 'style' },
    { rel: 'preload', href: tailwindCssUrl, as: 'style' },
    // Stylesheets
    { rel: 'stylesheet', href: fontsCssUrl },
    { rel: 'stylesheet', href: tailwindCssUrl },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers: toastHeaders } = await getToast(request);

  const userId = await getSessionUserId(request);
  const user = await getUser(userId);

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
    { headers: toastHeaders || {} },
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

type DocumentProps = { children: ReactNode; toast?: Toast | null };

function Document({ children, toast }: DocumentProps) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="overflow-x-hidden bg-gray-50 font-sans text-gray-900 antialiased">
        <GlobalLoading />
        {children}
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
