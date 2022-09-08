import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { useLoaderData, useOutletContext, useParams } from '@remix-run/react';
import { EmptyState } from '~/design-system/EmptyState';
import { InboxIcon } from '@heroicons/react/24/outline';
import { ProposalsList } from '~/components/ProposalsList';
import ProposalsFilters from '~/components/ProposalsFilters';
import { Pagination } from '~/design-system/Pagination';
import type { Filters } from '~/services/organizers/event.server';
import { searchProposals, validateFilters } from '~/services/organizers/event.server';
import { validatePage } from '~/services/utils/pagination.server';
import { mapErrorToResponse } from '~/services/errors';
import type { OrganizerEventContext } from '../$eventSlug';

export const loader = async ({ request, params }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  const url = new URL(request.url);
  const filters = validateFilters(url.searchParams);
  const page = validatePage(url.searchParams);

  try {
    const results = await searchProposals(params.eventSlug!, uid, filters, page);
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

function hasFilters(filters: Filters) {
  return Object.values(filters).filter(Boolean).length !== 0;
}

export default function OrganizerEventProposalsRoute() {
  const { results, filters, pagination } = useLoaderData<typeof loader>();
  const { slug, eventSlug } = useParams();
  const { event } = useOutletContext<OrganizerEventContext>();

  if (results.length === 0 && !hasFilters(filters)) {
    return (
      <Container className="my-4 sm:my-16">
        <EmptyState
          icon={InboxIcon}
          label="No proposals yet!"
          description="Open the call for paper and share your event link to get more proposals!"
        >
          <h2 className="sr-only">Event proposals</h2>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container className="my-4 sm:my-8">
      <h2 className="sr-only">Event proposals</h2>
      <ProposalsFilters filters={filters} formats={event.formats} categories={event.categories} />
      <ProposalsList proposals={results} />
      <Pagination
        pathname={`/organizer/${slug}/${eventSlug}`}
        current={pagination.current}
        total={pagination.total}
        className="mt-8"
      />
    </Container>
  );
}
