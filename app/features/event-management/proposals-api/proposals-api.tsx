import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { getWebApiEvent, webApiMiddleware } from '~/shared/web-api/web-api.middleware.ts';
import type { Route } from './+types/proposals-api.ts';
import { EventProposalsApi } from './services/proposals-api.server.ts';

export const middleware = [webApiMiddleware];

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const event = getWebApiEvent(context);
  const filters = parseUrlFilters(request.url);
  const proposals = await EventProposalsApi.proposals(event, filters);
  return Response.json(proposals);
};
