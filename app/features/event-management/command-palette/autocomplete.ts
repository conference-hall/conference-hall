import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { Autocomplete, parseUrlFilters } from './services/autocomplete.server.ts';

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const filters = parseUrlFilters(request.url);

  return Autocomplete.for(authorizedEvent).search(filters);
};
