import { useMemo } from 'react';

import { NavTabs } from '~/design-system/navigation/NavTabs.tsx';

import { NewEventButton } from './NewEventModal/NewEventModal.tsx';

type Props = { slug: string; role: string };

export function TeamTabs({ slug, role }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/team/${slug}`, label: 'Events', enabled: true, end: true },
      { to: `/team/${slug}/settings`, label: 'Settings', enabled: role === 'OWNER' },
    ],
    [slug, role],
  );

  return (
    <div className="flex flex-col pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-0">
      <NavTabs tabs={tabs} py={4} scrollable />
      {role === 'OWNER' && <NewEventButton slug={slug} />}
    </div>
  );
}
