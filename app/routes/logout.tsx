import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { destroyUserSession } from '../features/auth/auth.server';

export const action: ActionFunction = async ({ request }) => {
  const destroyedCookie = await destroyUserSession(request);
  throw redirect('/', { headers: { 'Set-Cookie': destroyedCookie } });
};

export const loader: LoaderFunction = async () => {
  return redirect('/');
};
