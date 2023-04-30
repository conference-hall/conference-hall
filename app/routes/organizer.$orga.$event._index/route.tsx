import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { Container } from '~/design-system/layouts/Container';
import { parsePage } from '~/schemas/pagination';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsStatusUpdateSchema, ProposalsFiltersSchema } from '~/schemas/proposal';
import { addToast } from '~/libs/toasts/toasts';
import { updateProposalsStatus } from '~/routes/organizer.$orga.$event._index/server/update-proposal.server';
import { searchProposals } from './server/search-proposals.server';
import { ProposalsList } from './components/ProposalsList/ProposalsList';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { Pagination } from '~/design-system/Pagination';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { InboxIcon } from '@heroicons/react/24/outline';
import { useCheckboxSelection } from '~/design-system/useCheckboxSelection';
import { useMemo } from 'react';
import { ProposalsActionBar } from './components/ProposalsActionBar/ProposalsActionBar';
import { ProposalsFilters } from './components/ProposalsFilters/ProposalsFilters';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const filters = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);

  const results = await searchProposals(params.event, userId, filters.data ?? {}, page);
  return json(results);
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const { data, error } = await withZod(ProposalsStatusUpdateSchema).validate(form);
  if (error) return json(null);

  const result = await updateProposalsStatus(params.event, userId, data.selection, data.status);
  return json(null, await addToast(request, `${result} proposals marked as "${data.status.toLowerCase()}".`));
};

export default function OrganizerEventProposalsRoute() {
  const { event } = useOrganizerEvent();
  const { results, filters, pagination, statistics } = useLoaderData<typeof loader>();

  const ids = useMemo(() => results.map(({ id }) => id), [results]);
  const { checkboxRef, selection, checked, isSelected, onSelect, toggleAll } = useCheckboxSelection(ids);

  return (
    <Container className="my-4 sm:my-8">
      <h2 className="sr-only">Event proposals</h2>

      <div className="flex gap-8">
        <section className="flex-1 space-y-4">
          <ProposalsActionBar
            total={statistics.total}
            selection={selection}
            checked={checked}
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

        <section className="w-1/4">
          <ProposalsFilters
            filters={filters}
            statistics={statistics}
            eventFormats={event.formats}
            eventCategories={event.categories}
          />
        </section>
      </div>
    </Container>
  );
}
