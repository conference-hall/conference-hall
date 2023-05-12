import invariant from 'tiny-invariant';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Container } from '~/design-system/layouts/Container';
import { requireSession } from '~/libs/auth/session';
import { H2 } from '~/design-system/Typography';
import { Outlet, useLoaderData } from '@remix-run/react';
import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import { listEvents } from './server/list-events.server';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { EventCard } from '~/shared-components/EventCard';
import { useTeam } from '../team.$team/route';
import { useUser } from '~/root';
import { ArchivedFilters } from './components/ArchivedFilter';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');

  const url = new URL(request.url);
  const archived = Boolean(url.searchParams.get('archived'));

  const events = await listEvents(params.orga, userId, archived);

  return json(events);
};

export default function OrganizationEventsRoute() {
  const { user } = useUser();
  const { team } = useTeam();
  const events = useLoaderData<typeof loader>();

  const hasEvent = events.length > 0;

  return (
    <Container className="my-4 space-y-8 sm:my-8">
      <div className="flex items-center justify-between">
        <H2>Organization events</H2>
        <ArchivedFilters />
      </div>

      {hasEvent ? (
        <ul aria-label="Events list" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.slug}
              to={`/organizer/${team.slug}/${event.slug}`}
              name={event.name}
              type={event.type}
              logo={event.logo}
              cfpState={event.cfpState}
              cfpStart={event.cfpStart}
              cfpEnd={event.cfpEnd}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Square3Stack3DIcon}
          label={`Welcome to "${team.name}"`}
          className="flex flex-col items-center gap-2"
        />
      )}
      <Outlet context={{ user, team }} />
    </Container>
  );
}
