import { useMemo } from 'react';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = { orgaSlug: string; eventSlug: string; role: string };

export function EventTabs({ orgaSlug, eventSlug, role }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/organizer/${orgaSlug}/${eventSlug}`, label: 'Proposals reviews', enabled: true, end: true },
      { to: `/organizer/${orgaSlug}/${eventSlug}/emails`, label: 'Email campaigns', enabled: true },
      { to: `/organizer/${orgaSlug}/${eventSlug}/settings`, label: 'Settings', enabled: role === 'OWNER' },
    ],
    [orgaSlug, eventSlug, role]
  );

  return <NavTabs tabs={tabs} light />;
}
