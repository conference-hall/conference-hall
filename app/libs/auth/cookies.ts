import type { Session } from '@remix-run/node';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { auth as serverAuth } from './firebase.server';
import { config } from '../config';
import { createUser } from '~/shared-server/users/create-user.server';

const EXPIRATION = 60 * 60 * 24 * 5 * 1000; // 5 days

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    path: '/',
    httpOnly: true,
    secure: true,
    secrets: [config.COOKIE_SIGNED_SECRET],
    sameSite: 'lax',
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('cookie'));
}

export async function commitSession(session: Session) {
  return sessionStorage.commitSession(session);
}

export async function createSession(request: Request) {
  const form = await request.formData();
  const token = form.get('token') as string;
  const redirectTo = form.get('redirectTo')?.toString() || '/';

  const { uid, name, email, picture } = await serverAuth.verifyIdToken(token, true);

  const jwt = await serverAuth.createSessionCookie(token, { expiresIn: EXPIRATION });
  const userId = await createUser({ uid, name, email, picture });

  const session = await getSession(request);
  session.set('jwt', jwt);
  session.set('userId', userId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, { expires: new Date(Date.now() + EXPIRATION) }),
    },
  });
}

export async function killSession(request: Request) {
  const session = await getSession(request);
  return redirect('/', { headers: { 'Set-Cookie': await sessionStorage.destroySession(session) } });
}

export async function requireSession(request: Request) {
  const session = await getSession(request);
  const jwt = session.get('jwt');

  if (!jwt) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  try {
    const { uid } = await serverAuth.verifySessionCookie(jwt);
    return { uid };
  } catch (e) {
    throw redirect('/logout');
  }
}

export async function getSessionUid(request: Request) {
  const session = await getSession(request);
  const jwt = session.get('jwt');

  if (!jwt) return null;

  const token = await serverAuth.verifySessionCookie(jwt);
  return token?.uid;
}
