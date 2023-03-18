import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getEventProposals } from '~/services/api/get-event-proposals.server';
import { mapErrorToResponse } from '~/libs/errors';

export const loader = async ({ request, params }: LoaderArgs) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  invariant(params.event, 'Invalid event slug');
  invariant(key, 'Invalid api key');

  try {
    const proposals = await getEventProposals(params.event, key);
    return json(proposals);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};
