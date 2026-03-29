import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { Autocomplete, parseUrlFilters } from './services/autocomplete.server.ts';

export const loader = async ({ context, unstable_url: url }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const filters = parseUrlFilters(url);

  return Autocomplete.for(authorizedEvent).search(filters);
};
