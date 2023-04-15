import { PlusIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useMemo } from 'react';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = {
  authenticated: boolean;
  organizations?: Array<{ slug: string; name: string; role: string }>;
};

export function Navigation({ authenticated, organizations = [] }: Props) {
  const tabs = useMemo(() => {
    if (!authenticated) {
      return [{ label: 'Login', to: '/login', enabled: true }];
    }

    const hasOrganizations = Boolean(organizations && organizations.length > 0);

    const organizationLinks = organizations.map((organization) => ({
      to: `/organizer/${organization.slug}`,
      label: organization.name,
      icon: Square3Stack3DIcon,
    }));

    return [
      { to: `/speaker`, label: 'Home', enabled: true, end: true },
      { to: `/speaker/talks`, label: 'Talks', enabled: true },
      { to: `/speaker/profile`, label: 'Profile', enabled: true },
      {
        label: 'Organizations',
        enabled: hasOrganizations,
        links: [...organizationLinks, { to: '/organizer/new', label: 'New organization', icon: PlusIcon }],
      },
    ];
  }, [authenticated, organizations]);

  return <NavTabs tabs={tabs} variant="dark" />;
}
