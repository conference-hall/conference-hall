import { PlusIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useMemo } from 'react';

import { NavTabs } from '~/design-system/navigation/NavTabs.tsx';

type Props = {
  authenticated: boolean;
  isOrganizer?: boolean;
  teams?: Array<{ slug: string; name: string }>;
};

export function Navigation({ authenticated, isOrganizer, teams = [] }: Props) {
  const tabs = useMemo(() => {
    if (!authenticated) {
      return [{ label: 'Login', to: '/login', enabled: true }];
    }

    const teamLinks = teams.map((team) => ({
      to: `/team/${team.slug}`,
      label: team.name,
      icon: Square3Stack3DIcon,
    }));

    return [
      { to: `/speaker`, label: 'Home', enabled: true, end: true },
      { to: `/speaker/talks`, label: 'Talks library', enabled: true },
      { to: `/speaker/profile`, label: 'Profile', enabled: true },
      {
        label: 'Teams',
        enabled: isOrganizer,
        links: [...teamLinks, { to: '/team/new', label: 'New team', icon: PlusIcon }],
      },
    ];
  }, [authenticated, isOrganizer, teams]);

  return <NavTabs tabs={tabs} variant="dark" />;
}
