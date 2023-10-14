import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { TeamRole } from '@prisma/client';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Container } from '~/design-system/layouts/Container.tsx';
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
    <Container className="my-4 flex flex-col gap-4 sm:mt-8 md:flex-row">
      <H2 srOnly>Team settings</H2>

      <NavSideMenu
        aria-label="Team settings menu"
        items={menus}
        className="w-full md:w-64 md:sticky md:top-4 md:self-start"
      />

      <div className="min-w-0 flex-1 space-y-6">
        <Outlet context={{ user, team }} />
      </div>
    </Container>
  );
}
