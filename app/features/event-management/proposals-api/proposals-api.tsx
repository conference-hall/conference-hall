import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { EventApi } from '~/.server/event-web-api/event-api.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { ForbiddenError } from '~/shared/errors.server.ts';
import type { Route } from './+types/proposals-api.ts';

const API_KEY_SCHEMA = z.object({ key: z.string() });

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const result = parseWithZod(url.searchParams, { schema: API_KEY_SCHEMA });

  if (result.status !== 'success') throw new ForbiddenError('API key is required');

  const filters = parseUrlFilters(request.url);
  const eventApi = new EventApi(params.event, result.value.key);
  const events = await eventApi.proposals(filters);
  return Response.json(events);
};
