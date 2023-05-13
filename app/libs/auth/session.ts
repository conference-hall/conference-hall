import type { Session } from '@remix-run/node';
import { createCookieSessionStorage, redirect } from '@remix-run/node';

import { createUserAccount } from '~/server/users/create-user-account.server';

import { config } from '../config';
import { auth as serverAuth } from './firebase.server';

const MAX_AGE_SEC = 60 * 60 * 24 * 10; // 10 days
const MAX_AGE_MS = MAX_AGE_SEC * 1000;

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
  return sessionStorage.commitSession(session, { maxAge: MAX_AGE_SEC });
}

export async function createSession(request: Request) {
  const form = await request.formData();
  const token = form.get('token') as string;
  const redirectTo = form.get('redirectTo')?.toString() || '/';

  const { uid, name, email, picture, firebase } = await serverAuth.verifyIdToken(token, true);

  const jwt = await serverAuth.createSessionCookie(token, { expiresIn: MAX_AGE_MS });
  const userId = await createUserAccount({ uid, name, email, picture, provider: firebase.sign_in_provider });

  const session = await getSession(request);
  session.set('jwt', jwt);
  session.set('uid', uid);
  session.set('userId', userId);

  return redirect(redirectTo, { headers: { 'Set-Cookie': await commitSession(session) } });
}

export async function destroySession(request: Request) {
  const session = await getSession(request);
  return redirect('/', { headers: { 'Set-Cookie': await sessionStorage.destroySession(session) } });
}

export async function requireSession(request: Request): Promise<string> {
  const session = await getSession(request);
  const jwt = session.get('jwt');
  const uid = session.get('uid');
  const userId = session.get('userId');

  if (!jwt || !uid || !userId) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  try {
    const token = await serverAuth.verifySessionCookie(jwt);
    if (uid !== token.uid) {
      throw redirect('/logout');
    }
    return userId;
  } catch (e) {
    throw redirect('/logout');
  }
}

export async function getSessionUserId(request: Request): Promise<string | null> {
  const session = await getSession(request);
  const jwt = session.get('jwt');
  const uid = session.get('uid');
  const userId = session.get('userId');

  if (!jwt || !uid || !userId) return null;

  try {
    const token = await serverAuth.verifySessionCookie(jwt, true);
    if (uid !== token.uid) return null;
    return userId;
  } catch (e) {
    return null;
  }
}

export async function getSessionToken(request: Request) {
  const session = await getSession(request);
  const jwt = session.get('jwt');
  return serverAuth.verifySessionCookie(jwt, true);
}
