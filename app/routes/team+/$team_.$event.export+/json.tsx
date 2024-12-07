import type { LoaderFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant';
import { CfpReviewsExports } from '~/.server/reviews/cfp-reviews-exports.ts';

import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(userId, params.team, params.event);

  const results = await exports.forJson(filters);

  return Response.json(results);
};
