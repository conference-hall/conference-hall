import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { CfpReviewsSearch } from '~/domains/organizer-cfp-reviews/CfpReviewsSearch.ts';
import { parseUrlFilters } from '~/domains/organizer-cfp-reviews/proposal-search-builder/ProposalSearchBuilder.types.ts';
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
