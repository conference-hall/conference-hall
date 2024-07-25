import type { LoaderFunctionArgs } from '@remix-run/node';
import { json2csv } from 'json-2-csv';
import invariant from 'tiny-invariant';

import { CfpReviewsSearch } from '~/.server/reviews/cfp-reviews-search.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const search = CfpReviewsSearch.for(userId, params.team, params.event);
  const results = await search.forJsonExport(filters);

  return new Response(json2csv(results), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
};
