import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { CfpReviewsSearch } from './services/cfp-reviews-search.server.ts';

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const filters = parseUrlFilters(request.url);
  return CfpReviewsSearch.for(authUser.id, params.team, params.event).autocomplete(filters);
};
