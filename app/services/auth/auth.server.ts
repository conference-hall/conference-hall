import * as admin from 'firebase-admin';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { config } from '../config';
import { createUser } from '../user.server';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: config.FIREBASE_PROJECT_ID,
  });
}

const expiresIn = 60 * 60 * 24 * 5 * 1000;

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
    path: '/',
    secrets: [config.COOKIE_SIGNED_SECRET],
    sameSite: 'lax',
  },
});

/**
 * checks that the current session is a valid session be getting the token
 * from the session cookie and validating it with firebase
 */
export const isSessionValid = async (request: Request) => {
  const session = await getSession(request.headers.get('cookie'));
  try {
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    const decodedTokenId = await admin.auth().verifySessionCookie(session.get('idToken'), true /** checkRevoked */);
    return decodedTokenId.uid;
  } catch (error) {
    return null;
  }
};

export const sessionRequired = async (request: Request) => {
  const uid = await isSessionValid(request);
  if (!uid) {
    const redirectTo = new URL(request.url).pathname;
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return uid;
};

/**
 * login the session by verifying the token, if all is good create/set cookie
 * and redirect to the appropriate route
 */
export const sessionLogin = async (request: Request) => {
  const data = await request.formData();
  const idToken = data.get('tokenId') as string;
  const redirectTo = data.get('redirectTo') as string;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    // Create db user
    const { uid, name, email, picture } = decodedToken;
    await createUser({ uid, name, email, picture });
    // Set cookie policy for session cookie.
    const session = await getSession(request.headers.get('cookie'));
    session.set('idToken', sessionCookie);
    return redirect(redirectTo, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch (error) {
    console.error(error);
  }
};

/**
 * revokes the session cookie from the firebase admin instance
 * @param {*} request
 * @returns
 */
export const sessionLogout = async (request: Request) => {
  const session = await getSession(request.headers.get('cookie'));

  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  const decodedTokenId = await admin.auth().verifySessionCookie(session.get('idToken'), true /** checkRevoked */);
  await admin.auth().revokeRefreshTokens(decodedTokenId?.sub);
  return redirect('/', { headers: { 'Set-Cookie': await destroySession(session) } });
};
