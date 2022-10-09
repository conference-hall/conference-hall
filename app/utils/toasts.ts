import type { Session } from '@remix-run/node';
import { v4 as uuid } from 'uuid';
import { commitSession } from '~/services/auth/auth.server';

export type ToastData = { id: string; message: string; description?: string };

export async function createToast(session: Session, message: string, description?: string) {
  session.flash('toast', { id: uuid(), message, description });
  return { headers: { 'Set-Cookie': await commitSession(session) } };
}

export function getToast(session: Session): ToastData | null {
  const toast = (session.get('toast') as ToastData) || null;
  if (!toast) return null;
  return toast;
}
