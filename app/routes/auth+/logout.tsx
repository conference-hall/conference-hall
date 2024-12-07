import type { ActionFunctionArgs } from 'react-router';

import { destroySession } from '~/libs/auth/session.ts';

export const action = async ({ request }: ActionFunctionArgs) => {
  await destroySession(request);
};
