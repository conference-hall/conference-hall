import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { NavbarEvent } from '~/app-platform/components/navbar/navbar-event.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import { getRequiredAuthUser, requiredAuthMiddleware } from '~/shared/auth/auth.middleware.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import type { Route } from './+types/layout.ts';

export const middleware = [requiredAuthMiddleware];

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  await UserAccount.needsAdminRole(authUser.id);
  return null;
};

export default function AdminLayoutRoute() {
  const { t } = useTranslation();

  return (
    <>
      <NavbarEvent />

      <Page.NavHeader className="sm:space-between flex flex-col pb-2 sm:flex-row sm:items-center sm:pb-0">
        <NavTabs py={4} scrollable className="grow">
          <NavTab to={href('/admin')} end>
            {t('admin.nav.dashboard')}
          </NavTab>
          <NavTab to={href('/admin/users')}>{t('admin.nav.users')}</NavTab>
          <NavTab to={href('/admin/teams')}>{t('admin.nav.teams')}</NavTab>
          <NavTab to={href('/admin/flags')}>{t('admin.nav.flags')}</NavTab>
          <NavTab to={href('/admin/debug')}>{t('admin.nav.debug')}</NavTab>
        </NavTabs>
      </Page.NavHeader>

      <Outlet />
    </>
  );
}
