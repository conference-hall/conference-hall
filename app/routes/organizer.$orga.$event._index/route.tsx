import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation, useOutletContext } from '@remix-run/react';
import { mapErrorToResponse } from '~/libs/errors';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Container } from '~/design-system/Container';
import { Pagination } from '~/design-system/Pagination';
import { parsePage } from '~/schemas/pagination';
import type { OrganizerEventContext } from '../organizer.$orga.$event/route';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsStatusUpdateSchema, ProposalsFiltersSchema } from '~/schemas/proposal';
import { createToast } from '~/utils/toasts';
import { updateProposalsStatus } from '~/routes/organizer.$orga.$event._index/server/update-proposal.server';
import { searchProposals } from './server/search-proposals.server';
import { NoProposals } from './components/NoProposals';
import ProposalsFilters from './components/ProposalsFilters';
import { ProposalsList } from './components/ProposalsList';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');

  const url = new URL(request.url);
  const filters = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);

  try {
    const results = await searchProposals(params.orga, params.event, uid, filters.data ?? {}, page);
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();

  const { data, error } = await withZod(ProposalsStatusUpdateSchema).validate(form);
  if (error) return json(null);
  const result = await updateProposalsStatus(params.orga, params.event, uid, data.selection, data.status);
  return json(null, await createToast(session, `${result} proposals marked as "${data.status.toLowerCase()}".`));
};

export default function OrganizerEventProposalsRoute() {
  const { results, filters, pagination, total } = useLoaderData<typeof loader>();
  const { event } = useOutletContext<OrganizerEventContext>();
  const location = useLocation();

  const hasFilters = Object.values(filters).filter(Boolean).length !== 0;

  if (results.length === 0 && !hasFilters) return <NoProposals />;

  return (
    <Container className="my-4 sm:my-12">
      <h2 className="sr-only">Event proposals</h2>
      <ProposalsFilters filters={filters} formats={event.formats} categories={event.categories} />
      <ProposalsList proposals={results} total={total} />
      <Pagination pathname={location.pathname} current={pagination.current} total={pagination.total} className="mt-8" />
    </Container>
  );
}
