import { Outlet, useMatch, useRouteLoaderData } from 'react-router';
import { UserTeam } from '~/.server/team/user-team.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useFlag } from '../components/contexts/flags-context.tsx';
import { CurrentTeamProvider } from '../components/contexts/team-context.tsx';
import { Navbar } from '../components/navbar/navbar.tsx';
import type { Route } from './+types/$team.ts';
import { EventTabs } from './$team/components/event-tabs.tsx';
import { TeamTabs } from './$team/components/team-tabs.tsx';
import type { loader as routeEventLoader } from './$team.$event/_layout.tsx';
import { useScheduleFullscreen } from './$team.$event/schedule/components/header/use-schedule-fullscreen.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `${args.data?.name} | Conference Hall` }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return UserTeam.for(userId, params.team).get();
};

export default function TeamLayout({ loaderData: team }: Route.ComponentProps) {
  const event = useRouteLoaderData<typeof routeEventLoader>('team-current-event');
  const { isFullscreen } = useScheduleFullscreen();
  const isEventCreationRoute = Boolean(useMatch('/team/:team/new/*'));
  const speakersPageEnabled = useFlag('speakersPage');

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
          speakersPageEnabled={speakersPageEnabled}
          permissions={team.userPermissions}
        />
      ) : (
        <TeamTabs slug={team.slug} role={team.userRole} />
      )}

      <Outlet />
    </CurrentTeamProvider>
  );
}
