import { parseWithZod } from '@conform-to/zod/v4';
import { PlusIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { SearchInput } from '~/design-system/forms/search-input.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { parseUrlFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import { getObjectHash } from '~/shared/utils/object-hash.ts';
import type { Route } from './+types/proposals.ts';
import { ProposalsList } from './components/list/proposals-list.tsx';
import { ExportMenu } from './components/list/toolbar/export-menu.tsx';
import { FiltersMenu } from './components/list/toolbar/filters-menu.tsx';
import { FiltersTags } from './components/list/toolbar/filters-tags.tsx';
import { SortMenu } from './components/list/toolbar/sort-menu.tsx';
import { CfpReviewsSearch } from './services/cfp-reviews-search.server.ts';
import { ProposalStatusBulkSchema, ProposalStatusUpdater } from './services/proposal-status-updater.server.ts';

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const { userId } = getProtectedSession(context);
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  return CfpReviewsSearch.for(userId, params.team, params.event).search(filters, page);
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = getProtectedSession(context);
  const i18n = getI18n(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: ProposalStatusBulkSchema });
  if (result.status !== 'success') return toast('error', i18n.t('error.global'));

  const { selection, deliberationStatus, allPagesSelected } = result.value;
  const deliberate = ProposalStatusUpdater.for(userId, params.team, params.event);
  let count = 0;
  if (allPagesSelected) {
    const filters = parseUrlFilters(request.url);
    count = await deliberate.updateAll(filters, deliberationStatus);
  } else {
    count = await deliberate.update(selection, { deliberationStatus });
  }

  return toast(
    'success',
    i18n.t('event-management.proposals.feedbacks.status-changed', { count, status: deliberationStatus.toLowerCase() }),
  );
};

export default function ReviewsRoute({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { results, filters, pagination, statistics } = loaderData;
  const filtersHash = getObjectHash(filters);
  const { team } = useCurrentEventTeam();
  const { canCreateEventProposal } = team.userPermissions;

  return (
    <Page>
      <h2 className="sr-only">{t('event-management.nav.proposals')}</h2>

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput
              placeholder={t('event-management.proposals.search')}
              ariaLabel={t('event-management.proposals.search')}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex justify-between gap-2">
                <FiltersMenu />
                <SortMenu />
                <ExportMenu />
              </div>
              {canCreateEventProposal && (
                <Button iconLeft={PlusIcon} to={href('/team/:team/:event/proposals/new', params)}>
                  {t('event-management.proposals.new-proposal')}
                </Button>
              )}
            </div>
          </div>
          <FiltersTags filters={filters} />
        </div>

        <ProposalsList proposals={results} pagination={pagination} statistics={statistics} filtersHash={filtersHash} />
      </div>
    </Page>
  );
}
