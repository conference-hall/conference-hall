import { parseWithZod } from '@conform-to/zod';
import { useTranslation } from 'react-i18next';
import { CfpReviewsSearch } from '~/.server/reviews/cfp-reviews-search.ts';
import { ProposalStatusBulkSchema, ProposalStatusUpdater } from '~/.server/reviews/proposal-status-updater.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { parseUrlFilters } from '~/.server/shared/proposal-search-builder.types.ts';
import { SearchInput } from '~/design-system/forms/search-input.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { getObjectHash } from '~/libs/utils/object-hash.ts';
import type { Route } from './+types/proposals.ts';
import { ExportMenu } from './components/proposals-page/actions/export-menu.tsx';
import { FiltersMenu } from './components/proposals-page/filters/filters-menu.tsx';
import { FiltersTags } from './components/proposals-page/filters/filters-tags.tsx';
import { SortMenu } from './components/proposals-page/filters/sort-menu.tsx';
import { ProposalsList } from './components/proposals-page/proposals-list.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  return CfpReviewsSearch.for(userId, params.team, params.event).search(filters, page);
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: ProposalStatusBulkSchema });
  if (result.status !== 'success') return toast('error', t('error.global'));

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
    t('event-management.proposals.feedbacks.status-changed', { count, status: deliberationStatus.toLowerCase() }),
  );
};

export default function ReviewsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { results, filters, pagination, statistics } = loaderData;
  const filtersHash = getObjectHash(filters);

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
            <div className="flex gap-2">
              <FiltersMenu />
              <SortMenu />
              <ExportMenu />
            </div>
          </div>
          <FiltersTags filters={filters} />
        </div>

        <ProposalsList proposals={results} pagination={pagination} statistics={statistics} filtersHash={filtersHash} />
      </div>
    </Page>
  );
}
