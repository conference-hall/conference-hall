import { PlusIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useMemo } from 'react';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = {
  authenticated: boolean;
  isOrganizer?: boolean;
  teams?: Array<{ slug: string; name: string; role: string }>;
};

export function Navigation({ authenticated, isOrganizer, teams = [] }: Props) {
  const tabs = useMemo(() => {
    if (!authenticated) {
      return [{ label: 'Login', to: '/login', enabled: true }];
    }

    const organizationLinks = teams.map((organization) => ({
      to: `/organizer/${organization.slug}`,
      label: organization.name,
      icon: Square3Stack3DIcon,
    }));

    return [
      { to: `/speaker`, label: 'Home', enabled: true, end: true },
      { to: `/speaker/talks`, label: 'Talks library', enabled: true },
      { to: `/speaker/profile`, label: 'Profile', enabled: true },
      {
        label: 'Organizations',
        enabled: isOrganizer,
        links: [...organizationLinks, { to: '/organizer', label: 'New organization', icon: PlusIcon }],
      },
    ];
  }, [authenticated, isOrganizer, teams]);

  return <NavTabs tabs={tabs} variant="dark" />;
}
