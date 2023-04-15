import { PlusIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useMemo } from 'react';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = {
  organizations?: Array<{ slug: string; name: string; role: string }>;
};

export function SpeakerNavLinks({ organizations = [] }: Props) {
  const tabs = useMemo(() => {
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
  }, [organizations]);

  return <NavTabs tabs={tabs} variant="dark" />;
}
