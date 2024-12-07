import type { LoaderFunctionArgs } from 'react-router';
import { Outlet, useLoaderData, useMatch, useRouteLoaderData } from 'react-router';
import invariant from 'tiny-invariant';

import { UserTeam } from '~/.server/team/user-team.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

import { CurrentTeamProvider } from '../__components/contexts/team-context.tsx';
import { Navbar } from '../__components/navbar/navbar.tsx';
import { EventTabs } from './$team+/__components/event-tabs.tsx';
import { TeamTabs } from './$team+/__components/team-tabs.tsx';
import type { loader as routeEventLoader } from './$team.$event+/_layout';
import { useScheduleFullscreen } from './$team.$event+/schedule+/__components/header/use-schedule-fullscreen.tsx';

export const meta = mergeMeta<typeof loader>(({ data }) => (data ? [{ title: `${data.name} | Conference Hall` }] : []));

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');

  return UserTeam.for(userId, params.team).get();
};

export default function TeamLayout() {
  const team = useLoaderData<typeof loader>();
  const event = useRouteLoaderData<typeof routeEventLoader>('routes/team+/$team.$event+/_layout');

  const { isFullscreen } = useScheduleFullscreen();
  const isEventCreationRoute = Boolean(useMatch('/team/:team/new/*'));

  if (isFullscreen || isEventCreationRoute) {
    return (
      <CurrentTeamProvider team={team}>
        <Outlet />
      </CurrentTeamProvider>
    );
  }

  return (
    <CurrentTeamProvider team={team}>
      <Navbar layout="team" />

      {event ? (
        <EventTabs
          teamSlug={team.slug}
          eventSlug={event.slug}
          eventType={event.type}
          permissions={team.userPermissions}
        />
      ) : (
        <TeamTabs slug={team.slug} role={team.userRole} />
      )}

      <Outlet />
    </CurrentTeamProvider>
  );
}
