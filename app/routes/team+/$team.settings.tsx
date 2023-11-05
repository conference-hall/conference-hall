import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { TeamRole } from '@prisma/client';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/root.tsx';
import { allowedForTeam } from '~/routes/__server/teams/check-user-role.server.ts';

import { useTeam } from './$team.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  await allowedForTeam(params.team, userId, [TeamRole.OWNER]);
  return null;
};

const getMenuItems = (team?: string) => [
  { to: `/team/${team}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/team/${team}/settings/members`, icon: UserGroupIcon, label: 'Members' },
];

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const { team } = useTeam();

  const menus = getMenuItems(team.slug);

  return (
    <PageContent className="lg:grid lg:grid-cols-12">
      <H2 srOnly>Team settings</H2>

      <NavSideMenu
        aria-label="Team settings menu"
        items={menus}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4"
      />

      <div className="lg:col-span-9">
        <Outlet context={{ user, team }} />
      </div>
    </PageContent>
  );
}
