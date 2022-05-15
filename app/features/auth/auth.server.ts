import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { config } from '../../services/config';
import { db } from '../../services/db';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: config.FIREBASE_PROJECT_ID,
  });
}

const expiresIn = 60 * 60 * 24 * 5 * 1000;

const storage = createCookieSessionStorage({
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

export async function createUserSession(request: Request) {
  try {
    const cookie = request.headers.get('Cookie');
    const session = await storage.getSession(cookie);
    const data = await request.formData();
    const tokenId = data.get('tokenId') as string;
    const redirectTo = data.get('redirectTo') as string;
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const user = await createUserFromToken(decodedToken);
    const firebaseSession = await admin.auth().createSessionCookie(tokenId, { expiresIn });
    session.set('firebaseSession', firebaseSession);
    session.set('uid', user.id);
    const newCookie = await storage.commitSession(session);
    return redirect(redirectTo, { headers: { 'Set-Cookie': newCookie } });
  } catch (e) {
    return redirect('/login');
  }
}

async function createUserFromToken(decodedToken: DecodedIdToken) {
  const { uid, name, email, picture } = decodedToken;
  const user = await db.user.findUnique({ where: { id: uid } });
  if (user) return user;
  return db.user.create({ data: { id: uid, name, email, photoURL: picture } });
}

export async function destroyUserSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  const session = await storage.getSession(cookie);
  const destroyedCookie = await storage.destroySession(session);
  return redirect('/', { headers: { 'Set-Cookie': destroyedCookie } });
}

export async function requireUserSession(request: Request) {
  try {
    const cookie = request.headers.get('Cookie');
    const session = await storage.getSession(cookie);
    const firebaseSession = session.get('firebaseSession');
    if (!firebaseSession) {
      throw redirect(getLoginUrl(request));
    }
    const token = await admin.auth().verifySessionCookie(firebaseSession, true);
    if (!token.uid) {
      throw destroyUserSession(request);
    }
    return token.uid;
  } catch (error) {
    throw redirect(getLoginUrl(request));
  }
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture: string;
  bio: string;
  references: string;
  company: string;
  github: string;
  twitter: string;
  address: string;
};

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const cookie = request.headers.get('Cookie');
  const session = await storage.getSession(cookie);
  const uid = session.get('uid');
  if (!uid || typeof uid !== 'string') {
    return null;
  }
  const user = await db.user.findUnique({ where: { id: uid } });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    picture: user.photoURL || '',
    bio: user.bio || '',
    references: user.references || '',
    company: user.company || '',
    github: user.github || '',
    twitter: user.twitter || '',
    address: user.address || '',
  };
}

export async function requireAuthUser(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw destroyUserSession(request);
  }
  return user;
}

function getLoginUrl(request: Request) {
  const redirectTo = new URL(request.url).pathname;
  const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
  return `/login?${searchParams}`;
}
