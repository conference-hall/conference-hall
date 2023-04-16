import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import type { OrganizationContext } from '../organizer.$orga/route';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/layouts/Container';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H2 } from '~/design-system/Typography';
import { Outlet, useLoaderData, useOutletContext, useParams } from '@remix-run/react';
import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { listEvents } from './server/list-events.server';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { EventCard } from '~/shared-components/EventCard';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  invariant(params.orga, 'Invalid organization slug');

  const events = await listEvents(params.orga, uid);
  return json(events);
};

export default function OrganizationEventsRoute() {
  const { organization } = useOutletContext<OrganizationContext>();
  const events = useLoaderData<typeof loader>();
  const { orga } = useParams();

  const hasEvent = events.length > 0;

  return (
    <Container className="my-4 space-y-8 sm:my-8">
      <H2 srOnly>Events</H2>

      {hasEvent ? (
        <ul aria-label="Events list" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.slug}
              to={`/organizer/${orga}/${event.slug}`}
              name={event.name}
              type={event.type}
              bannerUrl={event.bannerUrl}
              cfpState={event.cfpState}
              cfpStart={event.cfpStart}
              cfpEnd={event.cfpEnd}
            />
          ))}
        </ul>
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
