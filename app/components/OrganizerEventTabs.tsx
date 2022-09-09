import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';

type Props = { orgaSlug: string; eventSlug: string; role: string };

export function OrganizerEvenTabs({ orgaSlug, eventSlug, role }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/organizer/${orgaSlug}/${eventSlug}/proposals`, label: 'Proposals', enabled: true },
      { to: `/organizer/${orgaSlug}/${eventSlug}/speakers`, label: 'Speakers', enabled: true },
      { to: `/organizer/${orgaSlug}/${eventSlug}/settings`, label: 'Settings', enabled: role === 'OWNER' },
    ],
    [orgaSlug, eventSlug, role]
  );

  return <NavTabs tabs={tabs} />;
}
