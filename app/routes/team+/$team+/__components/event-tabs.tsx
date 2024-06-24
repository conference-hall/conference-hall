import { CalendarIcon, Cog6ToothIcon, HomeIcon, MegaphoneIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from '@remix-run/react';

import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import type { EventType } from '~/types/events.types';

type Props = { teamSlug: string; eventSlug: string; eventType: EventType; role: string };

export function EventTabs({ teamSlug, eventSlug, eventType, role }: Props) {
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();

  return (
    <Page.NavHeader>
      <NavTabs py={4} scrollable>
        <NavTab to={{ pathname: `/team/${teamSlug}/${eventSlug}`, search }} icon={HomeIcon} end>
          Overview
        </NavTab>

        <NavTab to={{ pathname: `/team/${teamSlug}/${eventSlug}/reviews`, search }} icon={QueueListIcon}>
          Proposals
        </NavTab>

        {role !== 'REVIEWER' && eventType === 'CONFERENCE' ? (
          <NavTab to={`/team/${teamSlug}/${eventSlug}/publication`} icon={MegaphoneIcon}>
            Publication
          </NavTab>
        ) : null}

        {role !== 'REVIEWER' && eventType === 'CONFERENCE' ? (
          <NavTab to={`/team/${teamSlug}/${eventSlug}/schedule`} icon={CalendarIcon}>
            Schedule
          </NavTab>
        ) : null}

        {role === 'OWNER' ? (
          <NavTab to={`/team/${teamSlug}/${eventSlug}/settings`} icon={Cog6ToothIcon}>
            Settings
          </NavTab>
        ) : null}
      </NavTabs>
    </Page.NavHeader>
  );
}
