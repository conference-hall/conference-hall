import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/open-planner.ts';
import { CfpReviewsExports } from './services/cfp-reviews-exports.server.ts';

export const action = async ({ request, context }: Route.ActionArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const i18n = getI18n(context);
  const filters = parseUrlFilters(request.url);
  const exports = CfpReviewsExports.for(authorizedEvent);
  await exports.forOpenPlanner(filters);
  return toast('success', i18n.t('event-management.proposals.export.open-planner.feedbacks'));
};
