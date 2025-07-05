import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { BG_COLOR } from '~/design-system/colors.ts';
import { useUser } from '../user-context.tsx';
import { LoginButton } from './login-button.tsx';
import { Logo } from './logo.tsx';
import { Navigation } from './navigation.tsx';
import { TeamBreadcrumb } from './team-breadcrumb.tsx';
import { UserMenu } from './user-menu.tsx';

export type NavbarLayout = 'default' | 'team' | 'auth';

type Props = {
  layout?: NavbarLayout;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export function Navbar({ layout = 'default', variant = 'primary', className }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <div className={cx(BG_COLOR, className)}>
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex w-full items-center">
          {/* Logo */}
          <Logo label={layout !== 'team' ? t('app.title') : undefined} variant={variant} />

          {user?.hasTeamAccess && layout === 'team' ? (
            /* Teams breadcrumb */
            <TeamBreadcrumb teams={user.teams} />
          ) : null}
        </div>

        <div className="hidden gap-4 lg:flex lg:shrink-0 lg:items-center lg:justify-end">
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
