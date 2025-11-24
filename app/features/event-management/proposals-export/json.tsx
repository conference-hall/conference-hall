import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { getRequiredAuthUser, requiredAuthMiddleware } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/json.ts';
import { CfpReviewsExports } from './services/cfp-reviews-exports.server.ts';

export const middleware = [requiredAuthMiddleware];

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(authUser.id, params.team, params.event);
  const results = await exports.forJson(filters);
  return Response.json(results, {
    headers: { 'Content-Disposition': `attachment; filename="${params.event}-proposals.json"` },
  });
};
