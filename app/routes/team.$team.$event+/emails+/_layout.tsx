import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { TeamRole } from '@prisma/client';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Container } from '~/design-system/layouts/Container';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { H2 } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server';

import { useTeam } from '../../team+/$team';
import { useOrganizerEvent } from '../_layout';

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
  const { event } = useOrganizerEvent();

  const menus = getMenuItems(team.slug, event.slug);

  return (
    <Container className="mt-4 flex gap-8 sm:mt-8">
      <H2 srOnly>Event settings</H2>

      <NavSideMenu aria-label="Emails campaign menu" items={menus} className="sticky top-4 self-start" />

      <div className="min-w-0 flex-1 space-y-6 sm:px-6 lg:px-0">
        <Outlet context={{ user, team, event }} />
      </div>
    </Container>
  );
}
