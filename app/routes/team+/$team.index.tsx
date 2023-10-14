import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Container } from '~/design-system/layouts/Container.tsx';
import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { H1 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/root.tsx';
import { EventCard } from '~/routes/__components/EventCard.tsx';

import { ArchivedFilters } from './__components/ArchivedFilter.tsx';
import { listEvents } from './__server/list-events.server.ts';
import { useTeam } from './$team.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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
        <ul aria-label="Events list" className="grid grid-cols-1 gap-4 lg:gap-8 lg:grid-cols-2">
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
