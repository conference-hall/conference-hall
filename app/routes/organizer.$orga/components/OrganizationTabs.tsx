import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';

type Props = { slug: string; role: string };

export function OrganizationTabs({ slug, role }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/organizer/${slug}`, label: 'Organization events', enabled: true, end: true },
      { to: `/organizer/${slug}/members`, label: 'Members', enabled: role !== 'REVIEWER' },
      { to: `/organizer/${slug}/settings`, label: 'Settings', enabled: role === 'OWNER' },
    ],
    [slug, role]
  );

  return <NavTabs tabs={tabs} light />;
}
