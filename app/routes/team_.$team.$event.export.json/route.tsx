import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session';
import { parseProposalsFilters } from '~/schemas/proposal';

import { exportProposals } from './server/export-proposals.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const filters = parseProposalsFilters(url.searchParams);

  const results = await exportProposals(params.event, userId, filters);
  return json(results);
};
