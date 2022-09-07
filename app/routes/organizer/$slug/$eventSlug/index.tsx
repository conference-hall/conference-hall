import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { useLoaderData } from '@remix-run/react';
import { EmptyState } from '~/design-system/EmptyState';
import { InboxIcon } from '@heroicons/react/24/outline';
import { ProposalsList } from '~/components/ProposalsList';
import ProposalsFilters from '~/components/ProposalsFilters';
import { Pagination } from '~/design-system/Pagination';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json([]);
};

export default function OrganizerEventProposalsRoute() {
  const proposals = useLoaderData<typeof loader>();

  if (proposals.length > 0) {
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
      <ProposalsFilters />
      <ProposalsList total={2} />
      <Pagination pathname="/organizer/gdg-nantes/devfest-nantes" current={1} total={9} className="mt-8" />
    </Container>
  );
}
