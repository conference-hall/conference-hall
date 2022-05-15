import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { destroyUserSession } from '../features/auth/auth.server';

export const action: ActionFunction = async ({ request }) => {
  return destroyUserSession(request);
};

export const loader: LoaderFunction = async () => {
  return redirect('/');
};
