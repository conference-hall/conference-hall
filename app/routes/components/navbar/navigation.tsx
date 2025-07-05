import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';
import { TeamsDropdown } from './dropdowns/teams-dropdown.tsx';
import { LoginButton } from './login-button.tsx';

type Props = {
  authenticated: boolean;
  teams?: Array<{ slug: string; name: string; events: Array<{ slug: string; name: string }> }>;
  withTeams?: boolean;
};

export function Navigation({ authenticated, teams = [], withTeams = false }: Props) {
  const { t } = useTranslation();

  if (!authenticated) {
    return <LoginButton />;
  }

  return (
    <NavTabs variant="dark">
      <NavTab to={href('/speaker')} end variant="dark">
        {t('navbar.speaker')}
      </NavTab>
      {withTeams ? <TeamsDropdown teams={teams} /> : null}
    </NavTabs>
  );
}
