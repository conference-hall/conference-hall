import type { LoaderFunction } from '@remix-run/node';
import { killSession } from '~/libs/auth/cookies';

export const loader: LoaderFunction = async ({ request }) => {
  return killSession(request);
};
