import { json2csv } from 'json-2-csv';
import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { requireAuth } from '~/shared/authentication/auth.middleware.ts';
import {
  AuthorizedEventContext,
  requireAuthorizedEvent,
  requireAuthorizedTeam,
} from '~/shared/authorization/authorization.middleware.ts';
import type { Route } from './+types/csv.ts';
import { ProposalsExport } from './services/proposals-export.server.ts';

export const middleware = [requireAuth, requireAuthorizedTeam, requireAuthorizedEvent];

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const filters = parseUrlFilters(request.url);

  const json = await ProposalsExport.forUser(authorizedEvent).toJson(filters);

  const csvContent = json2csv(
    json.proposals.map((result) => ({
      ...result,
      tags: result.tags.join(','),
      languages: result.languages.join(','),
      formats: result.formats.join(','),
      categories: result.categories.join(','),
      speakers: formatObjectArray(result.speakers),
    })),
  );

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.event}-proposals.csv"`,
    },
  });
};

const formatObjectArray = (objects?: Array<{ name: string }>): string => {
  return objects?.map((object) => object.name).join(',') ?? '';
};
