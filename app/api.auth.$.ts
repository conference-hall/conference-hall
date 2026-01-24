import type { Route } from './+types/api.auth.$.ts';
import { auth } from './auth.server.ts';

// todo(auth): rename file (and organizer others better-auth files)
// todo(auth): check it is not rate limited by api/v1 rate limits
export const loader = async ({ request }: Route.LoaderArgs) => {
  return auth.handler(request);
};

export const action = async ({ request }: Route.ActionArgs) => {
  return auth.handler(request);
};
