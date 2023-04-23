import { getSession, commitSession } from '../auth/session';

export type ToastData = { id: string; message: string };

export async function createToast(request: Request, message: string) {
  const session = await getSession(request);
  session.flash('toast', message);
  return { headers: { 'Set-Cookie': await commitSession(session) } };
}
