import type { ActionFunction, LoaderFunction } from 'remix';
import { redirect } from 'remix';
import { destroyUserSession } from '../server/auth/auth.server';

export const action: ActionFunction = async ({ request }) => {
  return destroyUserSession(request);
};

export const loader: LoaderFunction = async () => {
  return redirect('/');
};
