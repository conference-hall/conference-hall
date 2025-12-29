import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { requireAuth } from '~/shared/authentication/auth.middleware.ts';
import {
  AuthorizedEventContext,
  requireAuthorizedEvent,
  requireAuthorizedTeam,
} from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/json.ts';
import { CfpReviewsExports } from './services/cfp-reviews-exports.server.ts';

export const middleware = [requireAuth, requireAuthorizedTeam, requireAuthorizedEvent];

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(authorizedEvent);
  const results = await exports.forJson(filters);
  return Response.json(results, {
    headers: { 'Content-Disposition': `attachment; filename="${params.event}-proposals.json"` },
  });
};
