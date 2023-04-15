import { useMemo } from 'react';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = {
  hasOrganization: boolean;
};

export function SpeakerNavLinks({ hasOrganization }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/speaker`, label: 'Home', enabled: true, end: true },
      { to: `/speaker/talks`, label: 'Talks', enabled: true },
      { to: `/speaker/profile`, label: 'Profile', enabled: true },
      { to: `/organizer`, label: 'Organizations', enabled: hasOrganization },
    ],
    [hasOrganization]
  );

  return <NavTabs tabs={tabs} variant="dark" />;
}
