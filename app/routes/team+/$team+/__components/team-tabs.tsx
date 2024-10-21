import { Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';
import { Badge } from '~/design-system/badges.tsx';

import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ROLE_NAMES } from '~/libs/formatters/team-roles.ts';
import type { TeamRole } from '~/types/team.types.ts';

type Props = { slug: string; role: TeamRole };

export function TeamTabs({ slug, role }: Props) {
  return (
    <Page.NavHeader className="flex items-center justify-between">
      <NavTabs py={4} scrollable>
        <NavTab to={`/team/${slug}`} icon={StarIcon} end>
          Events
        </NavTab>
        <NavTab to={`/team/${slug}/settings`} icon={Cog6ToothIcon}>
          Settings
        </NavTab>
      </NavTabs>
      <Badge color="blue">{ROLE_NAMES[role]}</Badge>
    </Page.NavHeader>
  );
}
