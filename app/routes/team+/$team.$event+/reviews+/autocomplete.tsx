import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { CfpReviewsSearch } from '~/.server/reviews/cfp-reviews-search.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);

  const results = await CfpReviewsSearch.for(userId, params.team, params.event).search(filters, page);

  return json(results);
};