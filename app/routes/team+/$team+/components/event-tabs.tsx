import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { CalendarIcon, Cog6ToothIcon, HomeIcon, MegaphoneIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router';

import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import type { EventType } from '~/types/events.types';
import type { UserPermissions } from '~/types/team.types.ts';

type Props = { teamSlug: string; eventSlug: string; eventType: EventType; permissions: UserPermissions };

export function EventTabs({ teamSlug, eventSlug, eventType, permissions }: Props) {
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  return (
    <Page.NavHeader className="flex items-center space-between">
      <NavTabs py={4} className="grow" scrollable>
        <NavTab to={{ pathname: `/team/${teamSlug}/${eventSlug}`, search }} icon={HomeIcon} end>
          Overview
        </NavTab>

        <NavTab to={{ pathname: `/team/${teamSlug}/${eventSlug}/reviews`, search }} icon={QueueListIcon}>
          Proposals
        </NavTab>

        {eventType === 'CONFERENCE' && permissions.canPublishEventResults ? (
          <NavTab to={`/team/${teamSlug}/${eventSlug}/publication`} icon={MegaphoneIcon}>
            Publication
          </NavTab>
        ) : null}

        {eventType === 'CONFERENCE' && permissions.canEditEventSchedule ? (
          <NavTab to={`/team/${teamSlug}/${eventSlug}/schedule`} icon={CalendarIcon} className="hidden md:flex">
            Schedule
          </NavTab>
        ) : null}

        {permissions.canEditEvent ? (
          <NavTab to={`/team/${teamSlug}/${eventSlug}/settings`} icon={Cog6ToothIcon}>
            Settings
          </NavTab>
        ) : null}
      </NavTabs>

      <Link
        to={`/${eventSlug}`}
        target="_blank"
        iconRight={ArrowTopRightOnSquareIcon}
        weight="medium"
        className="hidden lg:flex"
      >
        Event page
      </Link>
    </Page.NavHeader>
  );
}
