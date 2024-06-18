import { NavTab, NavTabs } from '~/design-system/navigation/NavTabs.tsx';

import { TeamsDropdown } from './dropdowns/TeamsDropdown';

type Props = {
  authenticated: boolean;
  isOrganizer?: boolean;
  teams?: Array<{ slug: string; name: string }>;
};

export function Navigation({ authenticated, isOrganizer, teams = [] }: Props) {
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
      {isOrganizer ? <TeamsDropdown teams={teams} /> : null}
    </NavTabs>
  );
}
