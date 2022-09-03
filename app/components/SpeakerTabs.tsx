import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';

export function SpeakerTabs() {
  const eventTabs = useMemo(
    () => [
      { to: '/speaker', label: 'Activity', enabled: true, end: true },
      { to: '/speaker/talks', label: 'Your talks', enabled: true },
      { to: '/speaker/settings', label: 'Settings', enabled: true },
    ],
    []
  );

  return <NavTabs tabs={eventTabs} />;
}
