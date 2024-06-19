import { NavTab, NavTabs } from '~/design-system/navigation/NavTabs.tsx';

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
      {isOrganizer ? (
        <NavTab to="/speaker/teams" end variant="dark">
          My teams
        </NavTab>
      ) : null}
    </NavTabs>
  );
}
