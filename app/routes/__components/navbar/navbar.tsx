import { cx } from 'class-variance-authority';

import { BG_COLOR } from '~/design-system/colors.ts';

import { LoginButton } from './dropdowns/login-button.tsx';
import { Logo } from './logo.tsx';
import { Navigation } from './navigation.tsx';
import { SearchEventsInput } from './search-events-input.tsx';
import { TeamBreadcrumb } from './team-breadcrumb.tsx';
import { UserMenu } from './user-menu.tsx';

export type NavbarLayout = 'default' | 'team' | 'auth';

type Props = {
  user: {
    name: string | null;
    email: string | null;
    picture: string | null;
    hasTeamAccess: boolean;
    notificationsUnreadCount: number;
    teams: Array<{ slug: string; name: string }>;
  } | null;
  layout?: NavbarLayout;
  variant?: 'primary' | 'secondary';
  withSearch?: boolean;
  className?: string;
};

export function Navbar({ user, layout = 'default', variant = 'primary', withSearch = false, className }: Props) {
  return (
    <div className={cx(BG_COLOR, className)}>
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex w-full items-center">
          {/* Logo */}
          <Logo label={!withSearch && layout !== 'team' ? 'Conference Hall' : undefined} variant={variant} />

          {user?.hasTeamAccess && layout === 'team' ? (
            /* Teams breadcrumb */
            <TeamBreadcrumb teams={user.teams} />
          ) : withSearch && layout === 'default' ? (
            /* Search */
            <SearchEventsInput />
          ) : null}
        </div>

        <div className="hidden gap-4 lg:flex lg:flex-shrink-0 lg:items-center lg:justify-end">
          {/* Navigation links */}
          {layout !== 'auth' ? (
            <Navigation
              authenticated={Boolean(user)}
              teams={user?.teams}
              withTeams={user?.hasTeamAccess && layout !== 'team'}
            />
          ) : null}

          {/* Avatar */}
          {user && (
            <UserMenu
              name={user.name}
              email={user.email}
              picture={user.picture}
              teams={user.teams}
              hasTeamAccess={user.hasTeamAccess}
              notificationsCount={user.notificationsUnreadCount}
            />
          )}
        </div>

        {/* Mobile menu */}
        <div className="flex lg:hidden">
          {user ? (
            <UserMenu
              name={user.name}
              email={user.email}
              picture={user.picture}
              teams={user.teams}
              hasTeamAccess={user.hasTeamAccess}
              notificationsCount={user.notificationsUnreadCount}
            />
          ) : layout !== 'auth' ? (
            <LoginButton />
          ) : null}
        </div>
      </div>
    </div>
  );
}
