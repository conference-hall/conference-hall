import { Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { TeamAuthorization } from '~/shared/user/team-authorization.server.ts';
import type { Route } from './+types/settings.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const authorization = new TeamAuthorization(userId, params.team);
  await authorization.checkMemberPermissions('canAccessTeam');
  return null;
};

export default function TeamSettingsLayout() {
  const { t } = useTranslation();
  const { slug } = useCurrentTeam();

  const menus = [
    {
      to: href('/team/:team/settings', { team: slug }),
      icon: Cog6ToothIcon,
      label: t('team.settings.nav.general'),
      end: true,
    },
    {
      to: href('/team/:team/settings/members', { team: slug }),
      icon: UserGroupIcon,
      label: t('team.settings.nav.members'),
    },
  ];

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H2 srOnly>{t('team.settings.heading')}</H2>

      <NavSideMenu
        aria-label={t('team.settings.menu')}
        items={menus}
        className="w-full mb-4 lg:mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
