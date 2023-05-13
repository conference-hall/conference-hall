import { useMemo } from 'react';

import { NavTabs } from '~/design-system/navigation/NavTabs';

import { NewEventButton } from './NewEventModal/NewEventModal';

type Props = { slug: string; role: string };

export function TeamTabs({ slug, role }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/team/${slug}`, label: 'Events', enabled: true, end: true },
      { to: `/team/${slug}/settings`, label: 'Settings', enabled: role === 'OWNER' },
    ],
    [slug, role]
  );

  return (
    <div className="flex items-center justify-between">
      <NavTabs tabs={tabs} py={4} />
      {role === 'OWNER' && <NewEventButton slug={slug} />}
    </div>
  );
}
