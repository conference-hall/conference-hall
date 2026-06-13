import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { Autocomplete } from './services/autocomplete.server.ts';
import { parseUrlFilters } from './types/autocomplete.types.ts';

export const loader = async ({ context, url }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const filters = parseUrlFilters(url);

  return Autocomplete.for(authorizedEvent).search(filters);
};
