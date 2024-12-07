import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from 'react-router';
import { Outlet } from 'react-router';
import invariant from 'tiny-invariant';

import { UserTeam } from '~/.server/team/user-team.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useCurrentTeam } from '~/routes/__components/contexts/team-context.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  await UserTeam.for(userId, params.team).needsPermission('canAccessTeam');
  return null;
};

const getMenuItems = (team?: string) => [
  { to: `/team/${team}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/team/${team}/settings/members`, icon: UserGroupIcon, label: 'Members' },
];

export default function TeamSettingsLayout() {
  const currentTeam = useCurrentTeam();

  const menus = getMenuItems(currentTeam.slug);

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H2 srOnly>Team settings</H2>

      <NavSideMenu
        aria-label="Team settings menu"
        items={menus}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
