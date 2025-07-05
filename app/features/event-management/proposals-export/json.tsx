import { CfpReviewsExports } from '~/.server/reviews/cfp-reviews-exports.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/json.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(userId, params.team, params.event);
  const results = await exports.forJson(filters);
  return Response.json(results, {
    headers: {
      'Content-Disposition': `attachment; filename="${params.event}-reviews.json"`,
    },
  });
};
