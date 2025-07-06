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
import { Navbar } from '~/app-platform/components/navbar/navbar.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { CurrentEventTeamProvider, useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { TeamFetcher } from '../team-management/services/team-fetcher.server.ts';
import type { Route } from './+types/layout.ts';
import { useScheduleFullscreen } from './schedule/components/header/use-schedule-fullscreen.tsx';
import { EventFetcher } from './services/event-fetcher.server.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `${args.data?.event.name} | ${args.data?.team.name} | Conference Hall` }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const url = new URL(request.url);
  if (url.pathname === `/team/${params.team}/${params.event}`) {
    return redirect(`/team/${params.team}/${params.event}/overview`);
  }

  const team = await TeamFetcher.for(userId, params.team).get();
  const event = await EventFetcher.for(userId, params.team, params.event).get();

  return { team, event };
};

export default function EventLayoutRoute({ loaderData }: Route.ComponentProps) {
  const { isFullscreen } = useScheduleFullscreen();
  return (
    <CurrentEventTeamProvider value={loaderData}>
      {!isFullscreen ? (
        <>
          <Navbar layout="team" />
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
  const { canEditEvent, canPublishEventResults, canEditEventSchedule } = team.userPermissions;

  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  const isProposalsRoute = Boolean(useMatch('/team/:team/:event/reviews/*'));
  const isSpeakersRoute = Boolean(useMatch('/team/:team/:event/speakers/*'));

  return (
    <Page.NavHeader className="flex items-center space-between">
      <NavTabs py={4} className="grow" scrollable>
        <NavTab
          to={{ pathname: href('/team/:team/:event/overview', { team: team.slug, event: event.slug }) }}
          icon={HomeIcon}
        >
          {t('event-management.nav.overview')}
        </NavTab>

        <NavTab
          to={{
            pathname: href('/team/:team/:event/reviews', { team: team.slug, event: event.slug }),
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

        {event.type === 'CONFERENCE' && canPublishEventResults ? (
          <NavTab
            to={href('/team/:team/:event/publication', { team: team.slug, event: event.slug })}
            icon={MegaphoneIcon}
          >
            {t('event-management.nav.publication')}
          </NavTab>
        ) : null}

        {event.type === 'CONFERENCE' && canEditEventSchedule ? (
          <NavTab
            to={href('/team/:team/:event/schedule', { team: team.slug, event: event.slug })}
            icon={CalendarIcon}
            className="hidden md:flex"
          >
            {t('event-management.nav.schedule')}
          </NavTab>
        ) : null}

        {canEditEvent ? (
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
