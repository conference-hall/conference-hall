import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { EventApi } from '~/.server/event-web-api/EventApi.ts';
import { parseUrlFilters } from '~/.server/shared/ProposalSearchBuilder.types';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  invariant(key, 'Invalid api key');

  const filters = parseUrlFilters(request.url);
  const eventApi = new EventApi(params.event, key);
  const proposals = await eventApi.proposals(filters);

  return json(proposals);
};
