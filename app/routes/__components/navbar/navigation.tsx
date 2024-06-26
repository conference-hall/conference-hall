import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

import { LoginButton } from './dropdowns/login-button.tsx';
import { TeamsDropdown } from './dropdowns/teams-dropdown.tsx';

type Props = {
  authenticated: boolean;
  teams?: Array<{ slug: string; name: string }>;
  showTeams?: boolean;
};

export function Navigation({ authenticated, teams = [], showTeams = false }: Props) {
  if (!authenticated) {
    return <LoginButton />;
  }

  return (
    <NavTabs variant="dark">
      <NavTab to="/speaker" end variant="dark">
        My profile
      </NavTab>
      {showTeams ? <TeamsDropdown teams={teams} /> : null}
    </NavTabs>
  );
}