import { parseUrlFilters } from '~/.server/proposal-search-builder.types.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/autocomplete.ts';
import { CfpReviewsSearch } from './services/cfp-reviews-search.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  return CfpReviewsSearch.for(userId, params.team, params.event).autocomplete(filters);
};
