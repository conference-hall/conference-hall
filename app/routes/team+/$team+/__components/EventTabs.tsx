import { useMemo } from 'react';

import { NavTabs } from '~/design-system/navigation/NavTabs.tsx';

type Props = { teamSlug: string; eventSlug: string; role: string };

export function EventTabs({ teamSlug, eventSlug, role }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/team/${teamSlug}/${eventSlug}`, label: 'Proposals reviews', enabled: true, end: true },
      { to: `/team/${teamSlug}/${eventSlug}/publication`, label: 'Publication', enabled: role !== 'REVIEWER' },
      { to: `/team/${teamSlug}/${eventSlug}/settings`, label: 'Settings', enabled: role === 'OWNER' },
    ],
    [teamSlug, eventSlug, role],
  );

  return <NavTabs tabs={tabs} py={4} scrollable />;
}
