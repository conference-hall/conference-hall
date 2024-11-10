import { PlusIcon } from '@heroicons/react/20/solid';
import { Square3Stack3DIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { TeamEvents } from '~/.server/team/team-events.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { EventCardLink } from '~/routes/__components/events/event-card.tsx';

import { useCurrentTeam } from '~/routes/__components/contexts/team-context.tsx';
import { ArchivedFilters } from './__components/archived-filter.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  const url = new URL(request.url);
  const archived = url.searchParams.get('archived') === 'true';

  return TeamEvents.for(userId, params.team).list(archived);
};

export default function TeamEventsRoute() {
  const currentTeam = useCurrentTeam();
  const events = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();
  const archived = searchParams.get('archived') === 'true';

  const hasEvent = events.length > 0;

  return (
    <Page>
      <Page.Heading title="Team events" subtitle="Manage your team events call for papers">
        <ArchivedFilters />
        {currentTeam.userPermissions.canCreateEvent ? (
          <ButtonLink to={`/team/${currentTeam.slug}/new`} variant="secondary" iconLeft={PlusIcon}>
            New event
          </ButtonLink>
        ) : null}
      </Page.Heading>

      {hasEvent ? (
        <ul aria-label="Events list" className="grid grid-cols-1 gap-4 lg:gap-8 lg:grid-cols-2">
          {events.map((event) => (
            <EventCardLink
              key={event.slug}
              to={`/team/${currentTeam.slug}/${event.slug}`}
              name={event.name}
              type={event.type}
              logoUrl={event.logoUrl}
              cfpState={event.cfpState}
              cfpStart={event.cfpStart}
              cfpEnd={event.cfpEnd}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Square3Stack3DIcon}
          label={archived ? 'No events archived' : `Welcome to "${currentTeam.name}"`}
          className="flex flex-col items-center gap-2"
        />
      )}
    </Page>
  );
}
