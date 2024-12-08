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
  TagIcon,
} from '@heroicons/react/24/outline';
import { Outlet } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import type { Route } from './+types/_layout.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  await UserEvent.for(userId, params.team, params.event).needsPermission('canEditEvent');
  return null;
};

const getMenuItems = (team?: string, event?: string, options?: Record<string, boolean>) => [
  { to: `/team/${team}/${event}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/team/${team}/${event}/settings/cfp`, icon: PaperAirplaneIcon, label: 'Call for paper' },
  { to: `/team/${team}/${event}/settings/tracks`, icon: SwatchIcon, label: 'Tracks' },
  { to: `/team/${team}/${event}/settings/tags`, icon: TagIcon, label: 'Proposal tags', isNew: true },
  { to: `/team/${team}/${event}/settings/customize`, icon: PaintBrushIcon, label: 'Customize' },
  {
    to: `/team/${team}/${event}/settings/survey`,
    icon: QuestionMarkCircleIcon,
    label: 'Speaker survey',
    isNew: options?.customSurveyEnabled,
  },
  { to: `/team/${team}/${event}/settings/review`, icon: StarIcon, label: 'Reviews' },
  { to: `/team/${team}/${event}/settings/notifications`, icon: EnvelopeIcon, label: 'Email notifications' },
  { to: `/team/${team}/${event}/settings/integrations`, icon: CpuChipIcon, label: 'Integrations' },
  { to: `/team/${team}/${event}/settings/api`, icon: CodeBracketIcon, label: 'Web API' },
];

export default function OrganizationSettingsRoute() {
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const menus = getMenuItems(currentTeam.slug, currentEvent.slug, { customSurveyEnabled: true });

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H2 srOnly>Event settings</H2>

      <NavSideMenu
        aria-label="Event settings menu"
        items={menus}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="space-y-6 lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
