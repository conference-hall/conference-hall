import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/json.ts';
import { CfpReviewsExports } from './services/cfp-reviews-exports.server.ts';

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
