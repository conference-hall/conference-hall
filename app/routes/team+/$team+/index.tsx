import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TeamEvents } from '~/.server/team/team-events.ts';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { EventCard } from '~/routes/__components/events/event-card.tsx';

import { useTeam } from '../__components/use-team.tsx';
import { ArchivedFilters } from './__components/archived-filter.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const url = new URL(request.url);
  const archived = url.searchParams.get('archived') === 'true';
  const events = await TeamEvents.for(userId, params.team).list(archived);

  return json(events);
};

export default function TeamEventsRoute() {
  const { team } = useTeam();
  const events = useLoaderData<typeof loader>();

  const hasEvent = events.length > 0;

  return (
    <Page className="flex flex-col">
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
    </Page>
  );
}
