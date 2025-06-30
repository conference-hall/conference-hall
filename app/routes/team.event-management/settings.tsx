import {
  BellIcon,
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
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { useFlag } from '../components/contexts/flags-context.tsx';
import type { Route } from './+types/settings.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  await UserEvent.for(userId, params.team, params.event).needsPermission('canEditEvent');
  return null;
};

const getMenuItems = (team: string, event: string, t: TFunction, isEmailCustomizationEnabled: boolean) => [
  {
    to: `/team/${team}/${event}/settings`,
    icon: Cog6ToothIcon,
    label: t('event-management.settings.menu.general'),
    end: true,
  },
  {
    to: `/team/${team}/${event}/settings/cfp`,
    icon: PaperAirplaneIcon,
    label: t('event-management.settings.menu.cfp'),
  },
  { to: `/team/${team}/${event}/settings/tracks`, icon: SwatchIcon, label: t('event-management.settings.menu.tracks') },
  { to: `/team/${team}/${event}/settings/tags`, icon: TagIcon, label: t('event-management.settings.menu.tags') },
  {
    to: `/team/${team}/${event}/settings/customize`,
    icon: PaintBrushIcon,
    label: t('event-management.settings.menu.customize'),
  },
  {
    to: `/team/${team}/${event}/settings/survey`,
    icon: QuestionMarkCircleIcon,
    label: t('event-management.settings.menu.survey'),
  },
  { to: `/team/${team}/${event}/settings/review`, icon: StarIcon, label: t('event-management.settings.menu.reviews') },
  {
    to: `/team/${team}/${event}/settings/notifications`,
    icon: BellIcon,
    label: t('event-management.settings.menu.notifications'),
  },
  {
    to: `/team/${team}/${event}/settings/emails`,
    icon: EnvelopeIcon,
    label: t('event-management.settings.menu.emails'),
    isNew: true,
    hidden: !isEmailCustomizationEnabled,
  },
  {
    to: `/team/${team}/${event}/settings/integrations`,
    icon: CpuChipIcon,
    label: t('event-management.settings.menu.integrations'),
  },
  {
    to: `/team/${team}/${event}/settings/api`,
    icon: CodeBracketIcon,
    label: t('event-management.settings.menu.web-api'),
  },
];

export default function OrganizationSettingsRoute() {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const isEmailCustomizationEnabled = useFlag('emailCustomization');
  const menus = getMenuItems(currentTeam.slug, currentEvent.slug, t, isEmailCustomizationEnabled);

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H2 srOnly>{t('event-management.settings.heading')}</H2>

      <NavSideMenu
        aria-label={t('event-management.settings.menu.heading')}
        items={menus}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="space-y-6 lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
