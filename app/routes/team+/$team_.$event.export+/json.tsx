import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { CfpReviewsSearch } from '~/domains/proposal-reviews/CfpReviewsSearch';
import { parseUrlFilters } from '~/domains/shared/ProposalSearchBuilder.types';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const search = CfpReviewsSearch.for(userId, params.team, params.event);
  const results = await search.forJsonExport(filters);

  return json(results);
};
