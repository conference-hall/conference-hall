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
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useUser } from '~/routes/__components/use-user.tsx';

import { useTeam } from '../../__components/use-team.tsx';
import { useEvent } from '../__components/useEvent.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  await UserEvent.for(userId, params.team, params.event).needsPermission('canEditEvent');
  return null;
};

const getMenuItems = (team?: string, event?: string) => [
  { to: `/team/${team}/${event}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/team/${team}/${event}/settings/cfp`, icon: PaperAirplaneIcon, label: 'Call for paper' },
  { to: `/team/${team}/${event}/settings/tracks`, icon: SwatchIcon, label: 'Tracks' },
  { to: `/team/${team}/${event}/settings/customize`, icon: PaintBrushIcon, label: 'Customize' },
  { to: `/team/${team}/${event}/settings/survey`, icon: QuestionMarkCircleIcon, label: 'Speaker survey' },
  { to: `/team/${team}/${event}/settings/review`, icon: StarIcon, label: 'Reviews' },
  { to: `/team/${team}/${event}/settings/notifications`, icon: EnvelopeIcon, label: 'Email notifications' },
  { to: `/team/${team}/${event}/settings/integrations`, icon: CpuChipIcon, label: 'Integrations' },
  { to: `/team/${team}/${event}/settings/api`, icon: CodeBracketIcon, label: 'Web API' },
];

export default function OrganizationSettingsRoute() {
  const { user } = useUser();
  const { team } = useTeam();
  const { event } = useEvent();

  const menus = getMenuItems(team.slug, event.slug);

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H2 srOnly>Event settings</H2>

      <NavSideMenu
        aria-label="Event settings menu"
        items={menus}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="space-y-6 lg:col-span-9">
        <Outlet context={{ user, team, event }} />
      </div>
    </Page>
  );
}
