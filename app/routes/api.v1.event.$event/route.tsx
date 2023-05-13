import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getEventProposals } from './server/get-event-proposals.server';
import { ProposalsFiltersSchema } from '~/schemas/proposal';

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  const result = ProposalsFiltersSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!result.success) return json(null);

  invariant(params.event, 'Invalid event slug');
  invariant(key, 'Invalid api key');

  const proposals = await getEventProposals(params.event, key, result.data);

  return json(proposals);
};
