import { CfpReviewsSearch } from '~/.server/reviews/cfp-reviews-search.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import type { Route } from './+types/autocomplete.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const filters = parseUrlFilters(request.url);
  return CfpReviewsSearch.for(userId, params.team, params.event).autocomplete(filters);
};
