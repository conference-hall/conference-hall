import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';

type SpeakerTabsProps = {
  hasOrganization: boolean;
};

export function SpeakerTabs({ hasOrganization }: SpeakerTabsProps) {
  const speakerTabs = useMemo(
    () => [
      { to: '/speaker', label: 'Activity', enabled: true, end: true },
      { to: '/speaker/talks', label: 'Your talks', enabled: true },
      { to: '/speaker/profile', label: 'Your profile', enabled: true },
      { to: '/organizer', label: 'Your organizations', enabled: hasOrganization },
    ],
    [hasOrganization]
  );

  return <NavTabs tabs={speakerTabs} />;
}
