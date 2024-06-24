import { Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';

import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

type Props = { slug: string; role: string };

export function TeamTabs({ slug, role }: Props) {
  return (
    <Page.NavHeader>
      <NavTabs py={4} scrollable>
        <NavTab to={`/team/${slug}`} icon={StarIcon} end>
          Events
        </NavTab>
        {role === 'OWNER' ? (
          <NavTab to={`/team/${slug}/settings`} icon={Cog6ToothIcon}>
            Settings
          </NavTab>
        ) : null}
      </NavTabs>
    </Page.NavHeader>
  );
}
