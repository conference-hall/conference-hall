import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { CfpReviewsSearch } from './services/cfp-reviews-search.server.ts';

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const filters = parseUrlFilters(request.url);
  return CfpReviewsSearch.for(authorizedEvent).autocomplete(filters);
};
