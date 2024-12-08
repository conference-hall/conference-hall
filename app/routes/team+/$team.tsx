import { Outlet, useMatch, useRouteLoaderData } from 'react-router';
import { UserTeam } from '~/.server/team/user-team.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { CurrentTeamProvider } from '../__components/contexts/team-context.tsx';
import { Navbar } from '../__components/navbar/navbar.tsx';
import { EventTabs } from './$team+/__components/event-tabs.tsx';
import { TeamTabs } from './$team+/__components/team-tabs.tsx';
import type { loader as routeEventLoader } from './$team.$event+/_layout';
import { useScheduleFullscreen } from './$team.$event+/schedule+/__components/header/use-schedule-fullscreen.tsx';
import type { Route } from './+types/$team.ts';

export const meta = ({ data }: Route.MetaArgs) => [{ title: `${data.name} | Conference Hall` }];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  return UserTeam.for(userId, params.team).get();
};

export default function TeamLayout({ loaderData: team }: Route.ComponentProps) {
  const event = useRouteLoaderData<typeof routeEventLoader>('team-current-event');
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
