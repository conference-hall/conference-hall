import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { Autocomplete, parseUrlFilters } from './services/autocomplete.server.ts';

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const filters = parseUrlFilters(request.url);

  return Autocomplete.for(authUser.id, params.team, params.event).search(filters);
};
