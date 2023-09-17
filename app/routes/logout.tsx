import type { LoaderFunction } from '@remix-run/node';

import { destroySession } from '~/libs/auth/session.ts';

export const loader: LoaderFunction = async ({ request }) => {
  return destroySession(request);
};
