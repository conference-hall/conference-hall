import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { Autocomplete, parseUrlFilters } from './services/autocomplete.server.ts';

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  const filters = parseUrlFilters(request.url);

  return Autocomplete.for(userId, params.team, params.event).search(filters);
};
