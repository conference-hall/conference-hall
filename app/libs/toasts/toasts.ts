import type { Session } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';
import { v4 as uuid } from 'uuid';

import { config } from '../config';

export type ToastData = { id: string; message: string };

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__toast',
    path: '/',
    httpOnly: true,
    secure: true,
    secrets: [config.COOKIE_SIGNED_SECRET],
    sameSite: 'strict',
  },
});

export async function addToast(request: Request, message: string) {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  session.flash('message', { id: uuid(), message });
  return { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } };
}

export async function getToastSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('cookie'));
}

export async function commitToastSession(session: Session) {
  return await sessionStorage.commitSession(session);
}
