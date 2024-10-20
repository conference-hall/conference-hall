import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

import { TeamsDropdown } from './dropdowns/teams-dropdown.tsx';
import { LoginButton } from './login-button.tsx';

type Props = {
  authenticated: boolean;
  teams?: Array<{ slug: string; name: string; events: Array<{ slug: string; name: string }> }>;
  withTeams?: boolean;
};

export function Navigation({ authenticated, teams = [], withTeams = false }: Props) {
  if (!authenticated) {
    return <LoginButton />;
  }

  return (
    <NavTabs variant="dark">
      <NavTab to="/speaker" end variant="dark">
        My profile
      </NavTab>
      {withTeams ? <TeamsDropdown teams={teams} /> : null}
    </NavTabs>
  );
}
