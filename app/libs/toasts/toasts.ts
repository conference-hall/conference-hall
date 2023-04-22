import { v4 as uuid } from 'uuid';
import { commitSession, getSession } from '../auth/cookies';

export type ToastData = { id: string; message: string };

export async function createToast(request: Request, message: string) {
  const session = await getSession(request);
  session.flash('toast', { id: uuid(), message });
  return { headers: { 'Set-Cookie': await commitSession(session) } };
}

export async function getToast(request: Request): Promise<ToastData | null> {
  const session = await getSession(request);
  const toast = (session.get('toast') as ToastData) || null;
  if (!toast) return null;
  return toast;
}
