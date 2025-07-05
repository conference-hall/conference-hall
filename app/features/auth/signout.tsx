import { destroySession } from '~/shared/auth/session.ts';
import type { Route } from './+types/signout.ts';

export const action = async ({ request }: Route.LoaderArgs) => {
  await destroySession(request, '/');
};
