import { useTranslation } from 'react-i18next';
import { href, useLocation } from 'react-router';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';

export function LoginButton() {
  const { t } = useTranslation();
  const location = useLocation();
  const redirectTo = new URLSearchParams([['redirectTo', location.pathname]]);
  const search = location.pathname ? redirectTo.toString() : undefined;

  return (
    <NavTabs variant="dark">
      <NavTab to={{ pathname: href('/auth/login'), search }} variant="dark">
        {t('navbar.login')}
      </NavTab>
    </NavTabs>
  );
}
