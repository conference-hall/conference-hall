import type { RouterContextProvider, Session } from 'react-router';
import { createCookieSessionStorage, redirect } from 'react-router';
import { getWebServerEnv } from 'servers/environment.server.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import { getLocale } from '../i18n/i18n.middleware.ts';
import { validateCaptchaToken } from './captcha.server.ts';
import { auth as serverAuth } from './firebase.server.ts';

const { COOKIE_SIGNED_SECRET } = getWebServerEnv();

const MAX_AGE_SEC = 60 * 60 * 24 * 10; // 10 days
const MAX_AGE_MS = MAX_AGE_SEC * 1000;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    path: '/',
    httpOnly: true,
    secure: true,
    secrets: [COOKIE_SIGNED_SECRET],
    sameSite: 'lax',
  },
});

async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('cookie'));
}

async function commitSession(session: Session) {
  return sessionStorage.commitSession(session, { maxAge: MAX_AGE_SEC });
}

export async function createSession(request: Request, context: Readonly<RouterContextProvider>) {
  const form = await request.formData();
  const token = form.get('token') as string;
  const captchaToken = form.get('captchaToken') as string;
  const redirectTo = form.get('redirectTo')?.toString() || '/';

  if (!token) return destroySession(request);

  const idToken = await serverAuth.verifyIdToken(token, true);
  const { uid, name, email, email_verified, picture, firebase } = idToken;

  // Validate captcha token only if feature is enabled and using password authentication
  const isCaptchaEnabled = await flags.get('captcha');
  if (isCaptchaEnabled && firebase.sign_in_provider === 'password') {
    const isCaptchaValid = await validateCaptchaToken(captchaToken);
    if (!isCaptchaValid) {
      throw new Response('Captcha validation failed', { status: 403 });
    }
  }

  const locale = getLocale(context);
  const jwt = await serverAuth.createSessionCookie(token, { expiresIn: MAX_AGE_MS });
  const userId = await UserAccount.register({ uid, name, email, picture, locale });

  const needVerification = await UserAccount.checkEmailVerification(
    email,
    email_verified,
    firebase.sign_in_provider,
    locale,
  );
  if (needVerification) return destroySession(request, '/auth/email-verification');

  const session = await getSession(request);
  session.set('jwt', jwt);
  session.set('uid', uid);
  session.set('userId', userId);

  return redirect(redirectTo, { headers: { 'Set-Cookie': await commitSession(session) } });
}

export async function destroySession(request: Request, redirectTo?: string) {
  const session = await getSession(request);
  const url = new URL(request.url);

  throw redirect(redirectTo ?? url.pathname, {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
}

export async function requireUserSession(request: Request) {
  const sessionUser = await getUserSession(request);

  if (!sessionUser) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }

  return sessionUser;
}

export async function getUserSession(request: Request) {
  const session = await getSession(request);
  const jwt = session.get('jwt') as string | null;
  const uid = session.get('uid') as string | null;
  const userId = session.get('userId') as string | null;

  if (!jwt || !uid || !userId) {
    return null;
  }

  try {
    const idToken = await serverAuth.verifySessionCookie(jwt, true);
    if (uid !== idToken.uid) throw new Error('Invalid token uid');

    return { userId, uid };
  } catch (_error) {
    await destroySession(request);
    return null;
  }
}

export async function sendEmailVerification(request: Request, context: Readonly<RouterContextProvider>) {
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

  const locale = getLocale(context);
  await UserAccount.checkEmailVerification(provider.email, false, 'password', locale);
}
