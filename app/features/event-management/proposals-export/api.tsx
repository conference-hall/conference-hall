import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import {
  AuthorizedApiEventContext,
  requireAuthorizedApiEvent,
} from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/api.ts';
import { ProposalsExport } from './services/proposals-export.server.ts';

export const middleware = [requireAuthorizedApiEvent];

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const authorizedApiEvent = context.get(AuthorizedApiEventContext);
  const filters = parseUrlFilters(request.url);

  const proposals = await ProposalsExport.forApi(authorizedApiEvent).toJson(filters);

  return Response.json(proposals);
};
