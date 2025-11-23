import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/autocomplete.ts';
import { CfpReviewsSearch } from './services/cfp-reviews-search.server.ts';

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  const filters = parseUrlFilters(request.url);
  return CfpReviewsSearch.for(userId, params.team, params.event).autocomplete(filters);
};
