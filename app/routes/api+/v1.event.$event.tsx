import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { parseProposalsFilters } from '~/routes/__types/proposal.ts';

import { getEventProposals } from './__server/get-event-proposals.server.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  const filters = parseProposalsFilters(url.searchParams);

  invariant(params.event, 'Invalid event slug');
  invariant(key, 'Invalid api key');

  const proposals = await getEventProposals(params.event, key, filters);

  return json(proposals);
};
