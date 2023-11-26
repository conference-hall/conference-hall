import { PlusIcon } from '@heroicons/react/20/solid';
import { useMemo } from 'react';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { NavTabs } from '~/design-system/navigation/NavTabs.tsx';

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
      {role === 'OWNER' && (
        <ButtonLink to={`/team/${slug}/new`} variant="secondary" iconLeft={PlusIcon}>
          New event
        </ButtonLink>
      )}
    </div>
  );
}
