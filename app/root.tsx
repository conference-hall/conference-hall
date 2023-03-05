import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { config } from './libs/config';
import { json } from '@remix-run/node';
import { createHead } from 'remix-island';
import { Meta, LiveReload, Outlet, Links, Scripts, useLoaderData, ScrollRestoration } from '@remix-run/react';
import { initializeFirebase } from './libs/auth/firebase';
import { commitSession, getSession } from './libs/auth/auth.server';
import { getUser } from './services/user/get-user.server';
import { Footer } from './components/Footer';
import { GlobalLoading } from './components/GlobalLoading';
import { Toast } from './design-system/Toast';
import { getToast } from './utils/toasts';
import tailwind from './tailwind.css';
import { listNotifications } from './services/user-notifications/list-notifications.server';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Conference Hall',
  viewport: 'width=device-width,initial-scale=1',
});

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    { rel: 'stylesheet', href: tailwind },
  ];
};

export const Head = createHead(() => (
  <>
    <Meta />
    <Links />
  </>
));

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
        useFirebaseEmulators: config.useEmulators,
      },
    },
    { headers: { 'Set-Cookie': await commitSession(session) } }
  );
};

export default function App() {
  const { user, notifications, firebase, toast } = useLoaderData<typeof loader>();

  initializeFirebase(firebase);

  return (
    <>
      <Head />
      <Outlet context={{ user, notifications }} />
      <Footer />
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
      <Toast toast={toast} />
      <GlobalLoading />
    </>
  );
}
