import { href, redirect, replace } from 'react-router';
import { RequireAuthContext, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/activate-access.ts';
import { TeamAccessRequests } from './services/team-access-request.server.ts';

export const middleware = [requireAuth];

export const loader = async ({ context, url }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  const i18n = getI18n(context);
  const token = url.searchParams.get('token');

  const headers = await toastHeaders('error', i18n.t('team.activate.error'));
  if (!token) return replace(href('/'), { headers });

  try {
    await TeamAccessRequests.activate(token, authUser.id);
  } catch (error) {
    if (error instanceof ForbiddenOperationError) {
      return replace(href('/'), { headers });
    }
    throw error;
  }

  return redirect('/team/new');
};
