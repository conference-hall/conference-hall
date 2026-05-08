import { redirect } from 'react-router';
import { RequireAuthContext, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import { NotFoundError } from '~/shared/errors.server.ts';
import type { Route } from './+types/activate-access.ts';
import { TeamAccessRequests } from './services/team-access-request.server.ts';

export const middleware = [requireAuth];

export const loader = async ({ context, url }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  const token = url.searchParams.get('token');

  if (!token) throw new NotFoundError('Invalid activation token');

  await TeamAccessRequests.activate(token, authUser.id);

  return redirect('/team/new');
};
