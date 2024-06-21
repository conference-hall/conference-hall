import { NavTab, NavTabs } from '~/design-system/navigation/NavTabs.tsx';

import { TeamsDropdown } from './dropdowns/teams-dropdown';

type Props = {
  authenticated: boolean;
  teams?: Array<{ slug: string; name: string }>;
  showTeams?: boolean;
};

export function Navigation({ authenticated, teams = [], showTeams = false }: Props) {
  if (!authenticated) {
    return (
      <NavTabs variant="dark">
        <NavTab to="/login" variant="dark">
          Login
        </NavTab>
      </NavTabs>
    );
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
