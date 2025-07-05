import { useTranslation } from 'react-i18next';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';

export function AdminTabs() {
  const { t } = useTranslation();
  return (
    <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
      <NavTabs py={4} scrollable className="grow">
        <NavTab to="/admin" end>
          {t('admin.nav.dashboard')}
        </NavTab>
        <NavTab to="/admin/users">{t('admin.nav.users')}</NavTab>
        <NavTab to="/admin/teams">{t('admin.nav.teams')}</NavTab>
        <NavTab to="/admin/flags">{t('admin.nav.flags')}</NavTab>
        <NavTab to="/admin/debug">{t('admin.nav.debug')}</NavTab>
      </NavTabs>
    </Page.NavHeader>
  );
}
