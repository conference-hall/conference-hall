import {
  CodeBracketIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  EnvelopeIcon,
  PaintBrushIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { TeamRole } from '@prisma/client';
import type { LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Container } from '~/design-system/layouts/Container';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { H2 } from '~/design-system/Typography';
import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';
import { allowedForEvent } from '~/server/teams/check-user-role.server';

import { useTeam } from '../../team+/$team';
import { useOrganizerEvent } from '../_layout';

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  await allowedForEvent(params.event, userId, [TeamRole.OWNER]);
  return null;
};

const getMenuItems = (team?: string, event?: string) => [
  { to: `/team/${team}/${event}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/team/${team}/${event}/settings/cfp`, icon: PaperAirplaneIcon, label: 'Call for paper' },
  { to: `/team/${team}/${event}/settings/tracks`, icon: SwatchIcon, label: 'Tracks' },
  { to: `/team/${team}/${event}/settings/customize`, icon: PaintBrushIcon, label: 'Customize' },
  { to: `/team/${team}/${event}/settings/survey`, icon: QuestionMarkCircleIcon, label: 'Speaker survey' },
  { to: `/team/${team}/${event}/settings/review`, icon: StarIcon, label: 'Proposals review' },
  { to: `/team/${team}/${event}/settings/notifications`, icon: EnvelopeIcon, label: 'Email notifications' },
  { to: `/team/${team}/${event}/settings/integrations`, icon: CpuChipIcon, label: 'Slack integration' },
  { to: `/team/${team}/${event}/settings/api`, icon: CodeBracketIcon, label: 'Web API' },
];

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const { team } = useTeam();
  const { event } = useOrganizerEvent();

  const menus = getMenuItems(team.slug, event.slug);

  return (
    <Container className="mt-4 flex gap-8 sm:mt-8">
      <H2 srOnly>Event settings</H2>

      <NavSideMenu aria-label="Event settings menu" items={menus} className="sticky top-4 self-start" />

      <div className="min-w-0 flex-1 space-y-6 sm:px-6 lg:px-0">
        <Outlet context={{ user, team, event }} />
      </div>
    </Container>
  );
}
