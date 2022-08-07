import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { sessionLogout } from '../services/auth/auth.server';

export const action: ActionFunction = async ({ request }) => {
  return sessionLogout(request);
};

export const loader: LoaderFunction = async () => {
  return redirect('/');
};
