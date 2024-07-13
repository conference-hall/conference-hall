import { useLocation } from '@remix-run/react';

import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

export function LoginButton() {
  const location = useLocation();
  const redirectTo = new URLSearchParams([['redirectTo', location.pathname]]);

  return (
    <NavTabs variant="dark">
      <NavTab
        to={{ pathname: '/auth/login', search: location.pathname ? redirectTo.toString() : undefined }}
        variant="dark"
      >
        Login
      </NavTab>
    </NavTabs>
  );
}
