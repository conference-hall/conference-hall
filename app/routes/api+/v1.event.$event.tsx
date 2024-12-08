import invariant from 'tiny-invariant';
import { EventApi } from '~/.server/event-web-api/event-api.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import type { Route } from './+types/v1.event.$event.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  invariant(key, 'Invalid api key');

  const filters = parseUrlFilters(request.url);
  const eventApi = new EventApi(params.event, key);

  const events = await eventApi.proposals(filters);
  return Response.json(events);
};
