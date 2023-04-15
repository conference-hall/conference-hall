import { PlusIcon } from '@heroicons/react/20/solid';
import { useMemo } from 'react';
import { ButtonLink } from '~/design-system/Buttons';
import { NavTabs } from '~/design-system/navigation/NavTabs';

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

  return (
    <div className="flex items-center justify-between">
      <NavTabs tabs={tabs} py={4} />
      <div>
        {role === 'OWNER' && (
          <ButtonLink to="new" iconLeft={PlusIcon}>
            New event
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
