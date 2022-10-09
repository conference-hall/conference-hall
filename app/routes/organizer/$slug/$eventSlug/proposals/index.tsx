import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useLocation, useOutletContext } from '@remix-run/react';
import { searchProposals } from '~/services/organizers/event.server';
import { mapErrorToResponse } from '~/services/errors';
import { sessionRequired } from '~/services/auth/auth.server';
import { ProposalsList } from '~/components/proposals-list/ProposalsList';
import ProposalsFilters from '~/components/proposals-list/ProposalsFilters';
import { NoProposals } from '~/components/proposals-list/NoProposals';
import { Container } from '~/design-system/Container';
import { Pagination } from '~/design-system/Pagination';
import { parsePage } from '~/schemas/pagination';
import type { OrganizerEventContext } from '../../$eventSlug';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import { MARK_AS_ACCEPTED_ACTION, MARK_AS_REJECTED_ACTION } from '~/components/proposals-list/UpdateStatusMenu';
import { EXPORT_ALL_ACTION, EXPORT_SELECTED_ACTION } from '~/components/proposals-list/ExportProposalsMenu';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const url = new URL(request.url);
  const filters = await withZod(ProposalsFiltersSchema).validate(url.searchParams);
  const page = await parsePage(url.searchParams);

  try {
    const results = await searchProposals(params.slug!, params.eventSlug!, uid, filters.data ?? {}, page);
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case MARK_AS_ACCEPTED_ACTION: {
      return json(null);
    }
    case MARK_AS_REJECTED_ACTION: {
      return json(null);
    }
    case EXPORT_SELECTED_ACTION: {
      return json(null);
    }
    case EXPORT_ALL_ACTION: {
      return json(null);
    }
  }
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
