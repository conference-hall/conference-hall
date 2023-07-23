import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventCard } from '~/components/EventCard';
import { Container } from '~/design-system/layouts/Container';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { H1 } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';

import { useTeam } from './$team';
import { ArchivedFilters } from './components/ArchivedFilter';
import { listEvents } from './server/list-events.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const url = new URL(request.url);
  const archived = Boolean(url.searchParams.get('archived'));

  const events = await listEvents(params.team, userId, archived);

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
        <H1>Team events</H1>
        <ArchivedFilters />
      </div>

      {hasEvent ? (
        <ul aria-label="Events list" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.slug}
              to={`/team/${team.slug}/${event.slug}`}
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
