import { destroySession } from '~/libs/auth/session.ts';
import type { Route } from './+types/logout.ts';

export const action = async ({ request }: Route.LoaderArgs) => {
  await destroySession(request, '/');
};
