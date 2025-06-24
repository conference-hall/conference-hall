import { Outlet, useMatch, useRouteLoaderData } from 'react-router';
import { UserTeam } from '~/.server/team/user-team.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useFlag } from '../components/contexts/flags-context.tsx';
import { CurrentTeamProvider } from '../components/contexts/team-context.tsx';
import { Navbar } from '../components/navbar/navbar.tsx';
import type { loader as routeEventLoader } from '../team.event-management/_layout.tsx';
import { EventTabs } from '../team.event-management/components/event-tabs.tsx';
import { useScheduleFullscreen } from '../team.event-management/components/schedule-page/header/use-schedule-fullscreen.tsx';
import type { Route } from './+types/_layout.ts';
import { TeamTabs } from './components/team-tabs.tsx';

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
          displaySpeakers={speakersPageEnabled && event.displayProposalsSpeakers}
          permissions={team.userPermissions}
        />
      ) : (
        <TeamTabs slug={team.slug} role={team.userRole} />
      )}

      <Outlet />
    </CurrentTeamProvider>
  );
}
