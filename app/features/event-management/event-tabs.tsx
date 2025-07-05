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
import { href, useMatch, useSearchParams } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import type { EventType } from '~/shared/types/events.types.ts';
import type { UserPermissions } from '~/shared/types/team.types.ts';

type Props = {
  teamSlug: string;
  eventSlug: string;
  eventType: EventType;
  displaySpeakers: boolean;
  permissions: UserPermissions;
};

// todo(folders): where to put this file?
export function EventTabs({ teamSlug, eventSlug, eventType, displaySpeakers, permissions }: Props) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  const isProposalsRoute = Boolean(useMatch('/team/:team/:event/reviews/*'));
  const isSpeakersRoute = Boolean(useMatch('/team/:team/:event/speakers/*'));

  return (
    <Page.NavHeader className="flex items-center space-between">
      <NavTabs py={4} className="grow" scrollable>
        <NavTab
          to={{ pathname: href('/team/:team/:event/overview', { team: teamSlug, event: eventSlug }) }}
          icon={HomeIcon}
        >
          {t('event-management.nav.overview')}
        </NavTab>

        <NavTab
          to={{
            pathname: href('/team/:team/:event/reviews', { team: teamSlug, event: eventSlug }),
            search: isProposalsRoute ? search : undefined,
          }}
          icon={QueueListIcon}
        >
          {t('event-management.nav.proposals')}
        </NavTab>

        {displaySpeakers ? (
          <NavTab
            to={{
              pathname: href('/team/:team/:event/speakers', { team: teamSlug, event: eventSlug }),
              search: isSpeakersRoute ? search : undefined,
            }}
            icon={UserGroupIcon}
          >
            {t('event-management.nav.speakers')}
          </NavTab>
        ) : null}

        {eventType === 'CONFERENCE' && permissions.canPublishEventResults ? (
          <NavTab
            to={href('/team/:team/:event/publication', { team: teamSlug, event: eventSlug })}
            icon={MegaphoneIcon}
          >
            {t('event-management.nav.publication')}
          </NavTab>
        ) : null}

        {eventType === 'CONFERENCE' && permissions.canEditEventSchedule ? (
          <NavTab
            to={href('/team/:team/:event/schedule', { team: teamSlug, event: eventSlug })}
            icon={CalendarIcon}
            className="hidden md:flex"
          >
            {t('event-management.nav.schedule')}
          </NavTab>
        ) : null}

        {permissions.canEditEvent ? (
          <NavTab to={href('/team/:team/:event/settings', { team: teamSlug, event: eventSlug })} icon={Cog6ToothIcon}>
            {t('common.settings')}
          </NavTab>
        ) : null}
      </NavTabs>

      <Link
        to={href('/:event', { event: eventSlug })}
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
