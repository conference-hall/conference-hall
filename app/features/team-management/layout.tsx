import { Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet, useMatch, useRouteLoaderData } from 'react-router';
import { UserTeam } from '~/.server/team/user-team.ts';
import { EventTabs } from '~/features/event-management/event-tabs.tsx';
import type { loader as routeEventLoader } from '~/features/event-management/layout.tsx';
import { useScheduleFullscreen } from '~/features/event-management/schedule/components/header/use-schedule-fullscreen.tsx';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { CurrentTeamProvider } from '~/routes/components/contexts/team-context.tsx';
import { Navbar } from '~/routes/components/navbar/navbar.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Badge } from '~/shared/design-system/badges.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';
import type { Route } from './+types/layout.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `${args.data?.name} | Conference Hall` }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return UserTeam.for(userId, params.team).get();
};

// todo(folders): check how to split layout for team and event management
export default function TeamLayout({ loaderData: team }: Route.ComponentProps) {
  const { t } = useTranslation();
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
          displaySpeakers={event.displayProposalsSpeakers}
          permissions={team.userPermissions}
        />
      ) : (
        <Page.NavHeader className="flex items-center justify-between">
          <NavTabs py={4} scrollable>
            <NavTab to={href('/team/:team', { team: team.slug })} icon={StarIcon} end>
              {t('common.events')}
            </NavTab>
            <NavTab to={href('/team/:team/settings', { team: team.slug })} icon={Cog6ToothIcon}>
              {t('common.settings')}
            </NavTab>
          </NavTabs>
          <Badge color="blue">{t(`common.member.role.label.${team.userRole}`)}</Badge>
        </Page.NavHeader>
      )}

      <Outlet />
    </CurrentTeamProvider>
  );
}
