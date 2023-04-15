import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import type { OrganizationContext } from '../organizer.$orga/route';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/layouts/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Link, Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import { ChevronRightIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/20/solid';
import { ButtonLink } from '~/design-system/Buttons';
import { listEvents } from './server/list-events.server';
import { EmptyState } from '~/design-system/layouts/EmptyState';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');

  const events = await listEvents(params.orga, uid);
  return json(events);
};

export default function OrganizationEventsRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  const events = useLoaderData<typeof loader>();

  const hasEvent = events.length > 0;

  return (
    <Container className="my-4 space-y-8 sm:my-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <H2>Events</H2>
        {organization.role === 'OWNER' && (
          <ButtonLink to="new" iconLeft={PlusIcon}>
            New event
          </ButtonLink>
        )}
      </div>

      {hasEvent ? (
        <div className="my-4 overflow-hidden border border-gray-200 bg-white shadow-sm sm:my-8 sm:rounded-md">
          <ul aria-label="Events list" className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.slug}>
                <Link to={event.slug} className="block hover:bg-gray-50">
                  <div className="flex px-4 py-4 sm:px-6">
                    <div className="min-w-0 flex-1 truncate sm:flex sm:items-center sm:justify-between">
                      <div className="flex items-baseline text-sm">
                        <Text variant="link" truncate>
                          {event.name}
                        </Text>
                        <Text variant="secondary" size="xs" truncate>
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
      ) : (
        <EmptyState
          icon={Square3Stack3DIcon}
          label={`Welcome to "${organization.name}"`}
          className="flex flex-col items-center gap-2"
        />
      )}
      <Outlet />
    </Container>
  );
}
