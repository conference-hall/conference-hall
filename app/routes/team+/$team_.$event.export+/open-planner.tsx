import { CfpReviewsExports } from '~/.server/reviews/cfp-reviews-exports.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import type { Route } from './+types/open-planner.ts';

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(userId, params.team, params.event);
  await exports.forOpenPlanner(filters);
  return toast('success', 'Exporting to OpenPlanner is in progress and may take a few minutes...');
};
