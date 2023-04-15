import { useMemo } from 'react';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = {
  organizations?: Array<{ slug: string; name: string; role: string }>;
};

export function SpeakerNavLinks({ organizations = [] }: Props) {
  const hasOrganizations = Boolean(organizations && organizations.length > 0);

  const tabs = useMemo(
    () => [
      { to: `/speaker`, label: 'Home', enabled: true, end: true },
      { to: `/speaker/talks`, label: 'Talks', enabled: true },
      { to: `/speaker/profile`, label: 'Profile', enabled: true },
      { to: `/organizer`, label: 'Organizations', enabled: hasOrganizations },
    ],
    [hasOrganizations]
  );

  return <NavTabs tabs={tabs} variant="dark" />;
}
