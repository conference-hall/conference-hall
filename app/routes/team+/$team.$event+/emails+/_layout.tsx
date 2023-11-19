import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { TeamRole } from '@prisma/client';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/root.tsx';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';

import { useTeam } from '../../$team.tsx';
import { useTeamEvent } from '../_layout.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  await allowedForEvent(params.event, userId, [TeamRole.OWNER, TeamRole.MEMBER]);
  return null;
};

const getMenuItems = (team?: string, event?: string) => [
  { to: `/team/${team}/${event}/emails`, icon: ShieldCheckIcon, label: 'Acceptation campaign' },
  { to: `/team/${team}/${event}/emails/rejected`, icon: ShieldExclamationIcon, label: 'Rejection campaign' },
];

export default function EventProposalEmails() {
  const { user } = useUser();
  const { team } = useTeam();
  const { event } = useTeamEvent();

  const menus = getMenuItems(team.slug, event.slug);

  return (
    <PageContent className="flex flex-col lg:flex-row">
      <H2 srOnly>Event settings</H2>

      <NavSideMenu
        aria-label="Emails campaign menu"
        items={menus}
        className="w-full self-start lg:w-60 lg:sticky lg:top-4"
      />

      <div className="flex-1 space-y-6">
        <Outlet context={{ user, team, event }} />
      </div>
    </PageContent>
  );
}
