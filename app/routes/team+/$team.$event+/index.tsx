import { parse } from '@conform-to/zod';
import { InboxIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';

import { useCheckboxSelection } from '~/design-system/forms/useCheckboxSelection.tsx';
import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { Pagination } from '~/design-system/Pagination.tsx';
import { CfpReviewsSearch, ProposalsStatusUpdateSchema } from '~/domains/organizer-cfp-reviews/CfpReviewsSearch.ts';
import { parseUrlFilters } from '~/domains/organizer-cfp-reviews/proposal-search-builder/ProposalSearchBuilder.types.ts';
import { parseUrlPage } from '~/domains/shared/Pagination.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { ProposalsActionBar } from './__components/ProposalsActionBar/ProposalsActionBar.tsx';
import { ProposalsFilters } from './__components/ProposalsFilters/ProposalsFilters.tsx';
import { ProposalsList } from './__components/ProposalsList/ProposalsList.tsx';
import { useTeamEvent } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const results = await CfpReviewsSearch.for(userId, params.team, params.event).search(filters, page);
  return json(results);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: ProposalsStatusUpdateSchema });
  if (!result.value) return json(null);

  const search = CfpReviewsSearch.for(userId, params.team, params.event);
  const count = await search.changeStatus(result.value.selection, result.value.status);
  return toast('success', `${count} proposals marked as "${result.value.status.toLowerCase()}".`);
};

export default function EventReviewsRoute() {
  const { event } = useTeamEvent();
  const { results, filters, pagination, statistics } = useLoaderData<typeof loader>();

  const ids = useMemo(() => results.map(({ id }) => id), [results]);
  const { checkboxRef, selection, allChecked, isSelected, onSelect, toggleAll } = useCheckboxSelection(
    ids,
    statistics.total,
  );

  return (
    <PageContent>
      <h2 className="sr-only">Event proposals</h2>

      <div className="flex flex-col gap-8 lg:flex-row">
        <section className="flex-1 space-y-4">
          <ProposalsActionBar
            total={statistics.total}
            selection={selection}
            checked={allChecked}
            onToggleAll={toggleAll}
            checkboxRef={checkboxRef}
          />

          {statistics.total > 0 ? (
            <ProposalsList proposals={results} isSelected={isSelected} onSelect={onSelect} />
          ) : (
            <EmptyState icon={InboxIcon} label="No proposals found!" />
          )}

          <Pagination {...pagination} />
        </section>

        <section className="w-full lg:w-1/4">
          <ProposalsFilters
            filters={filters}
            statistics={statistics}
            eventFormats={event.formats}
            eventCategories={event.categories}
          />
        </section>
      </div>
    </PageContent>
  );
}
