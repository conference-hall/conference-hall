import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getEventProposals } from './server/get-event-proposals.server';
import { parseProposalsFilters } from '~/schemas/proposal';

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  const filters = parseProposalsFilters(url.searchParams);

  invariant(params.event, 'Invalid event slug');
  invariant(key, 'Invalid api key');

  const proposals = await getEventProposals(params.event, key, filters);

  return json(proposals);
};
