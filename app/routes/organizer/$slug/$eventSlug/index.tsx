import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { useLoaderData } from '@remix-run/react';
import { ButtonLink } from '~/design-system/Buttons';
import { EmptyState } from '~/design-system/EmptyState';
import { InboxIcon } from '@heroicons/react/24/outline';
import { Input } from '~/design-system/forms/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json([]);
};

export default function OrganizerEventProposalsRoute() {
  const proposals = useLoaderData<typeof loader>();

  if (proposals.length === 0) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="sr-only">Event proposals</h2>
        <Input
          name="query"
          type="search"
          aria-label="Find a proposal"
          placeholder="Find a proposal"
          className="w-full sm:w-80"
          icon={MagnifyingGlassIcon}
        />
        <ButtonLink to="new">Export</ButtonLink>
      </div>
      <div className="my-4 overflow-hidden border border-gray-200 bg-white shadow-sm sm:my-8 sm:rounded-md">
        <ul aria-label="Proposals list" className="divide-y divide-gray-200">
          {proposals.map((_, index) => (
            <li key={index}></li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
