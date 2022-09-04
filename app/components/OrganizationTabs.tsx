import { useMemo } from 'react';
import { NavTabs } from '~/design-system/NavTabs';

type Props = { slug: string };

export function OrganizationTabs({ slug }: Props) {
  const tabs = useMemo(
    () => [
      { to: `/organizer/${slug}`, label: 'Events', enabled: true, end: true },
      { to: `/organizer/${slug}/members`, label: 'Members', enabled: true },
      { to: `/organizer/${slug}/settings`, label: 'Settings', enabled: true },
    ],
    [slug]
  );

  return <NavTabs tabs={tabs} />;
}
