import { User } from '@prisma/client';
import * as admin from 'firebase-admin'
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { createCookieSessionStorage, redirect } from 'remix';
import { config } from '../config';
import { db } from '../db';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: config.FIREBASE_PROJECT_ID,
  })
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
    const cookie = request.headers.get('Cookie')
    const session = await storage.getSession(cookie);
    const data = await request.formData()
    const tokenId = data.get('tokenId') as string
    const redirectTo = data.get('redirectTo') as string
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const user = await createUserFromToken(decodedToken);
    const firebaseSession = await admin.auth().createSessionCookie(tokenId, { expiresIn });
    session.set('firebaseSession', firebaseSession)
    session.set('uid', user.id)
    const newCookie = await storage.commitSession(session)
    return redirect(redirectTo, { headers: { 'Set-Cookie': newCookie } });
  } catch (e) {
    return redirect('login');
  }
}

async function createUserFromToken(decodedToken: DecodedIdToken) {
  const { uid, name, email, picture } = decodedToken;
  const user = await db.user.findUnique({ where: { id: uid } });
  if (user) return user;
  return db.user.create({ data: { id: uid, name, email, photoURL: picture } });
}

export async function destroyUserSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  const session = await storage.getSession(cookie);
  const destroyedCookie = await storage.destroySession(session)
  return redirect('/', { headers: { 'Set-Cookie': destroyedCookie } });
}

export async function requireUserSession(request: Request) {
  try {
    const cookie = request.headers.get('Cookie')
    const session = await storage.getSession(cookie);
    const firebaseSession = session.get('firebaseSession')
    if (!firebaseSession) {
      throw redirect(getLoginUrl(request))
    }
    const token = await admin.auth().verifySessionCookie(firebaseSession, true)
    return token.uid
  } catch (error)  {
    throw redirect(getLoginUrl(request))
  }
}

export async function getAuthUserId(request: Request) {
  const cookie = request.headers.get('Cookie')
  const session = await storage.getSession(cookie);
  const uid = session.get('uid')
  if (!uid || typeof uid !== "string") {
    return null;
  };
  return uid
}

export async function requireAuthUserId(request: Request) {
  const uid = await getAuthUserId(request);
  if (!uid) {
    throw destroyUserSession(request);
  }
  return uid;
}

export class AuthUser {
  id: string
  name: string | null
  email: string | null
  picture: string | null

  constructor(user: User) {
    this.id = user.id
    this.name = user.name
    this.email = user.email
    this.picture = user.photoURL
  }
}

export async function getAuthUser(request: Request) {
  const userId = await getAuthUserId(request);
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return new AuthUser(user);
}

export async function requireAuthUser(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    throw destroyUserSession(request);
  }
  return user;
}

function getLoginUrl(request: Request) {
  const redirectTo = new URL(request.url).pathname
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
  return `login?${searchParams}`
}
