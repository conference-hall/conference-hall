import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { needsAdminRole } from '~/.server/admin/authorization.ts';
import { Navbar } from '~/app-platform/components/navbar/navbar.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';
import type { Route } from './+types/layout.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  await needsAdminRole(userId);
  return null;
};

export default function AdminLayoutRoute() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />

      <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
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
