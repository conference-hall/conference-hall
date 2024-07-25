import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserTeam } from '~/.server/team/user-team.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/routes/__components/use-user.tsx';

import { useTeam } from '../__components/use-team.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  await UserTeam.for(userId, params.team).needsPermission('canEditTeam');
  return null;
};

const getMenuItems = (team?: string) => [
  { to: `/team/${team}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/team/${team}/settings/members`, icon: UserGroupIcon, label: 'Members' },
];

export default function TeamSettingsLayout() {
  const { user } = useUser();
  const { team } = useTeam();

  const menus = getMenuItems(team.slug);

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H2 srOnly>Team settings</H2>

      <NavSideMenu
        aria-label="Team settings menu"
        items={menus}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4"
      />

      <div className="lg:col-span-9">
        <Outlet context={{ user, team }} />
      </div>
    </Page>
  );
}
