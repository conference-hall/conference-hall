import { useMemo } from 'react';

import { NavTabs } from '~/design-system/navigation/NavTabs.tsx';
import type { EventType } from '~/types/events.types';

type Props = { teamSlug: string; eventSlug: string; eventType: EventType; role: string };

export function EventTabs({ teamSlug, eventSlug, eventType, role }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/team/${teamSlug}/${eventSlug}`, label: 'Proposals reviews', enabled: true, end: true },
      {
        to: `/team/${teamSlug}/${eventSlug}/publication`,
        label: 'Publication',
        enabled: role !== 'REVIEWER' && eventType === 'CONFERENCE',
      },
      { to: `/team/${teamSlug}/${eventSlug}/settings`, label: 'Settings', enabled: role === 'OWNER' },
    ],
    [teamSlug, eventSlug, eventType, role],
  );

  return <NavTabs tabs={tabs} py={4} scrollable />;
}
