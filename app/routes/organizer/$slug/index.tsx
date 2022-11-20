import type { LoaderArgs } from '@remix-run/node';
import type { OrganizationContext } from '../$slug';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/Container';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Link, Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { EmptyState } from '~/design-system/EmptyState';
import { ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline';
import { Input } from '~/design-system/forms/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ButtonLink } from '~/design-system/Buttons';
import { listEvents } from '~/services/organization/list-events.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const slug = params.slug!;
  const events = await listEvents(slug, uid);
  return json(events);
};

export default function OrganizationEventsRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  const events = useLoaderData<typeof loader>();

  if (events.length === 0) {
    return <OrganizationEventsEmpty organization={organization} />;
  }

  return (
    <Container className="my-4 sm:my-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="sr-only">Organization events</h2>
        <Input
          name="query"
          type="search"
          aria-label="Find an event"
          placeholder="Find an event"
          className="w-full sm:w-80"
          icon={MagnifyingGlassIcon}
        />
        {organization.role === 'OWNER' && <ButtonLink to="new">New event</ButtonLink>}
      </div>
      <div className="my-4 overflow-hidden border border-gray-200 bg-white shadow-sm sm:my-8 sm:rounded-md">
        <ul aria-label="Events list" className="divide-y divide-gray-200">
          {events.map((event) => (
            <li key={event.slug}>
              <Link to={event.slug} className="block hover:bg-gray-50">
                <div className="flex px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1 truncate sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-baseline text-sm">
                      <Text as="p" variant="link" className="truncate font-medium">
                        {event.name}
                      </Text>
                      <Text as="p" variant="secondary" size="xs" className="ml-1 truncate font-normal">
                        {event.type.toLowerCase()}
                      </Text>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Outlet />
    </Container>
  );
}

const OrganizationEventsEmpty = ({ organization }: OrganizationContext) => (
  <Container className="my-4 sm:my-16">
    <EmptyState icon={StarIcon} className="flex flex-col items-center gap-2">
      <h2 className="sr-only">Organization events</h2>
      <H2>{`Welcome to "${organization.name}"`}</H2>

      {organization.role === 'OWNER' ? (
        <>
          <Text variant="secondary">Get started by creating your first event.</Text>
          <ButtonLink to="new">New event</ButtonLink>
        </>
      ) : (
        <Text variant="secondary">No event created yet.</Text>
      )}
    </EmptyState>
    <Outlet />
  </Container>
);
