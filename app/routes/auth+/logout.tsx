import type { ActionFunctionArgs } from '@remix-run/node';

import { destroySession } from '~/libs/auth/session.ts';

export const action = async ({ request }: ActionFunctionArgs) => {
  await destroySession(request);
};
