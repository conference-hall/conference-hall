import { parse } from '@conform-to/zod';
import { InboxIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import invariant from 'tiny-invariant';

import { useCheckboxSelection } from '~/design-system/forms/useCheckboxSelection.tsx';
import { Container } from '~/design-system/layouts/Container.tsx';
import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { Pagination } from '~/design-system/Pagination.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { addToast } from '~/libs/toasts/toasts.ts';
import { parsePage } from '~/routes/__types/pagination.ts';
import { parseProposalsFilters, ProposalsStatusUpdateSchema } from '~/routes/__types/proposal.ts';
import { updateProposalsStatus } from '~/routes/team.$team.$event+/__server/update-proposal.server.ts';

import { ProposalsActionBar } from './__components/ProposalsActionBar/ProposalsActionBar.tsx';
import { ProposalsFilters } from './__components/ProposalsFilters/ProposalsFilters.tsx';
import { ProposalsList } from './__components/ProposalsList/ProposalsList.tsx';
import { searchProposals } from './__server/search-proposals.server.ts';
import { useOrganizerEvent } from './_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const filters = parseProposalsFilters(url.searchParams);
  const page = parsePage(url.searchParams);
  const results = await searchProposals(params.event, userId, filters, page);
  return json(results);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parse(form, { schema: ProposalsStatusUpdateSchema });
  if (!result.value) return json(null);

  const updated = await updateProposalsStatus(params.event, userId, result.value.selection, result.value.status);
  return json(null, await addToast(request, `${updated} proposals marked as "${result.value.status.toLowerCase()}".`));
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