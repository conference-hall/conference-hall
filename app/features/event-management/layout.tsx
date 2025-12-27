import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import {
  CalendarIcon,
  Cog6ToothIcon,
  HomeIcon,
  MegaphoneIcon,
  QueueListIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet, redirect, useMatch, useSearchParams } from 'react-router';
import { NavbarTeam } from '~/app-platform/components/navbar/navbar-team.tsx';
import { useUserTeamPermissions } from '~/app-platform/components/user-context.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { CurrentEventTeamProvider, useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { getRequiredAuthUser, requiredAuthMiddleware } from '~/shared/auth/auth.middleware.ts';
import { AuthorizedTeamContext, requireAuthorizedTeam } from '~/shared/authorization/authorization.middleware.ts';
import { TeamFetcher } from '../team-management/services/team-fetcher.server.ts';
import type { Route } from './+types/layout.ts';
import { useScheduleFullscreen } from './schedule/components/header/use-schedule-fullscreen.tsx';
import { EventFetcher } from './services/event-fetcher.server.ts';

// todo(autho): change with requireAuthorizedEvent
export const middleware = [requiredAuthMiddleware, requireAuthorizedTeam];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [
    { title: `${args.loaderData?.event.name} | ${args.loaderData?.team.name} | Conference Hall` },
  ]);
};

export const loader = async ({ request, params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const url = new URL(request.url);
  if (url.pathname === `/team/${params.team}/${params.event}`) {
    return redirect(`/team/${params.team}/${params.event}/overview`);
  }

  const authorizedTeam = context.get(AuthorizedTeamContext);
  const team = await TeamFetcher.for(authorizedTeam).get();
  const event = await EventFetcher.for(authUser.id, params.team, params.event).get();

  return { team, event };
};

export default function EventLayoutRoute({ loaderData }: Route.ComponentProps) {
  const { isFullscreen } = useScheduleFullscreen();
  return (
    <CurrentEventTeamProvider value={loaderData}>
      {!isFullscreen ? (
        <>
          <NavbarTeam />
          <EventTabs />
        </>
      ) : null}

      <Outlet />
    </CurrentEventTeamProvider>
  );
}

function EventTabs() {
  const { t } = useTranslation();
  const { team, event } = useCurrentEventTeam();
  const permissions = useUserTeamPermissions();

  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  const isProposalsRoute = Boolean(useMatch('/team/:team/:event/proposals/*'));
  const isSpeakersRoute = Boolean(useMatch('/team/:team/:event/speakers/*'));

  return (
    <Page.NavHeader className="space-between flex items-center">
      <NavTabs py={4} className="grow" scrollable>
        <NavTab
          to={{ pathname: href('/team/:team/:event/overview', { team: team.slug, event: event.slug }) }}
          icon={HomeIcon}
        >
          {t('event-management.nav.overview')}
        </NavTab>

        <NavTab
          to={{
            pathname: href('/team/:team/:event/proposals', { team: team.slug, event: event.slug }),
            search: isProposalsRoute ? search : undefined,
          }}
          icon={QueueListIcon}
        >
          {t('event-management.nav.proposals')}
        </NavTab>

        {event.displayProposalsSpeakers ? (
          <NavTab
            to={{
              pathname: href('/team/:team/:event/speakers', { team: team.slug, event: event.slug }),
              search: isSpeakersRoute ? search : undefined,
            }}
            icon={UserGroupIcon}
          >
            {t('event-management.nav.speakers')}
          </NavTab>
        ) : null}

        {event.type === 'CONFERENCE' && permissions.canPublishEventResults ? (
          <NavTab
            to={href('/team/:team/:event/publication', { team: team.slug, event: event.slug })}
            icon={MegaphoneIcon}
          >
            {t('event-management.nav.publication')}
          </NavTab>
        ) : null}

        {event.type === 'CONFERENCE' && permissions.canEditEventSchedule ? (
          <NavTab
            to={href('/team/:team/:event/schedule', { team: team.slug, event: event.slug })}
            icon={CalendarIcon}
            className="hidden md:flex"
          >
            {t('event-management.nav.schedule')}
          </NavTab>
        ) : null}

        {permissions.canEditEvent ? (
          <NavTab to={href('/team/:team/:event/settings', { team: team.slug, event: event.slug })} icon={Cog6ToothIcon}>
            {t('common.settings')}
          </NavTab>
        ) : null}
      </NavTabs>

      <Link
        to={href('/:event', { event: event.slug })}
        target="_blank"
        iconRight={ArrowTopRightOnSquareIcon}
        weight="medium"
        className="hidden! lg:inline-flex!"
      >
        {t('event-management.nav.event-page-link')}
      </Link>
    </Page.NavHeader>
  );
}
