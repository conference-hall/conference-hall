import type { ActionFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { CfpReviewsExports } from '~/.server/reviews/cfp-reviews-exports.ts';

import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(userId, params.team, params.event);

  await exports.forOpenPlanner(filters);

  return toast('success', 'Exporting to OpenPlanner is in progress and may take a few minutes...');
};
