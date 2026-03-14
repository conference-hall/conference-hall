import { auth } from '../../auth.server.ts';
import type { Route } from './+types/api.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  return auth.handler(request);
};

export const action = async ({ request }: Route.ActionArgs) => {
  return auth.handler(request);
};
