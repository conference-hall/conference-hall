import type { Session } from 'react-router';
import { createCookieSessionStorage, redirect } from 'react-router';
import { UserAccount } from '~/.server/user-registration/user-account.ts';
import { auth as serverAuth } from './firebase.server.ts';

const MAX_AGE_SEC = 60 * 60 * 24 * 10; // 10 days
const MAX_AGE_MS = MAX_AGE_SEC * 1000;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    path: '/',
    httpOnly: true,
    secure: true,
    secrets: [process.env.COOKIE_SIGNED_SECRET],
    sameSite: 'lax',
  },
});

async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('cookie'));
}

async function commitSession(session: Session) {
  return sessionStorage.commitSession(session, { maxAge: MAX_AGE_SEC });
}

export async function createSession(request: Request) {
  const form = await request.formData();
  const token = form.get('token') as string;
  const redirectTo = form.get('redirectTo')?.toString() || '/';

  if (!token) return destroySession(request);

  const idToken = await serverAuth.verifyIdToken(token, true);
  const { uid, name, email, email_verified, picture, firebase } = idToken;

  const jwt = await serverAuth.createSessionCookie(token, { expiresIn: MAX_AGE_MS });
  const userId = await UserAccount.register({ uid, name, email, picture });

  const needVerification = await UserAccount.checkEmailVerification(email, email_verified, firebase.sign_in_provider);
  if (needVerification) return destroySession(request, '/auth/email-verification');

  const session = await getSession(request);
  session.set('jwt', jwt);
  session.set('uid', uid);
  session.set('userId', userId);

  return redirect(redirectTo, { headers: { 'Set-Cookie': await commitSession(session) } });
}

export async function destroySession(request: Request, redirectTo = '/auth/login') {
  const session = await getSession(request);
  throw redirect(redirectTo, { headers: { 'Set-Cookie': await sessionStorage.destroySession(session) } });
}

export async function requireSession(request: Request): Promise<string> {
  const userId = await getSessionUserId(request);

  if (!userId) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }

  return userId;
}

export async function getSessionUserId(request: Request): Promise<string | null> {
  const session = await getSession(request);
  const jwt = session.get('jwt');
  const uid = session.get('uid');
  const userId = session.get('userId');

  if (!jwt || !uid || !userId) {
    return null;
  }

  try {
    const idToken = await serverAuth.verifySessionCookie(jwt, true);
    if (uid !== idToken.uid) throw new Error('Invalid token uid');
  } catch (_error) {
    await destroySession(request);
    return null;
  }

  return userId;
}

export async function sendEmailVerification(request: Request) {
  const session = await getSession(request);
  const jwt = session.get('jwt');
  const uid = session.get('uid');
  if (!jwt || !uid) return;

  const idToken = await serverAuth.verifySessionCookie(jwt, true);
  if (uid !== idToken.uid) return null;

  const firebaseUser = await serverAuth.getUser(uid);
  if (!firebaseUser) return null;

  const provider = firebaseUser.providerData.find((p) => p.providerId === 'password');
  if (!provider) return null;

  await UserAccount.checkEmailVerification(provider.email, false, 'password');
}
