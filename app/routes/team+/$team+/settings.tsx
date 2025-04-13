import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { UserTeam } from '~/.server/team/user-team.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import type { Route } from './+types/settings.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  await UserTeam.for(userId, params.team).needsPermission('canAccessTeam');
  return null;
};

// todo(i18n)
const getMenuItems = (team?: string) => [
  { to: `/team/${team}/settings`, icon: Cog6ToothIcon, label: 'General' },
  { to: `/team/${team}/settings/members`, icon: UserGroupIcon, label: 'Members' },
];

export default function TeamSettingsLayout() {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const menus = getMenuItems(currentTeam.slug);

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H2 srOnly>Team settings</H2>

      <NavSideMenu
        aria-label={t('team.settings.menu')}
        items={menus}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
