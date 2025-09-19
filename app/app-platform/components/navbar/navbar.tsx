import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { useRouteLoaderData } from 'react-router';
import { BG_COLOR } from '~/design-system/colors.ts';
import { Text } from '~/design-system/typography.tsx';
import { useUser } from '../user-context.tsx';
import { EventCommandPaletteButton } from './buttons/event-command-palette-button.tsx';
import { LoginButton } from './buttons/login-button.tsx';
import { LogoButton } from './buttons/logo-button.tsx';
import { MobileBackButton, useBackNavigation } from './buttons/mobile-back-button.tsx';
import { UserMenuButton } from './buttons/user-menu-button.tsx';
import { TeamBreadcrumb } from './dropdowns/team-breadcrumb.tsx';
import { Navigation } from './navigation.tsx';

export type NavbarLayout = 'default' | 'team' | 'auth';

type Props = { layout?: NavbarLayout; variant?: 'primary' | 'secondary'; className?: string };

// todo: rework navbar (split in different ones)
export function Navbar(props: Props) {
  return (
    <>
      <DesktopNavbar {...props} />
      <MobileNavbar {...props} />
    </>
  );
}

function DesktopNavbar({ layout = 'default', variant = 'primary', className }: Props) {
  const user = useUser();

  return (
    <div className={cx('hidden lg:flex h-16 items-center justify-between px-8', BG_COLOR, className)}>
      <div className="flex w-full items-center">
        <LogoButton variant={variant} />

        {user?.hasTeamAccess && layout === 'team' ? <TeamBreadcrumb teams={user.teams} /> : null}
      </div>

      <div className="gap-4 flex shrink-0 items-center justify-end">
        {layout === 'default' ? (
          <Navigation authenticated={Boolean(user)} teams={user?.teams} withTeams={user?.hasTeamAccess} />
        ) : null}

        {layout === 'team' ? <EventCommandPaletteButton /> : null}

        {user && (
          <UserMenuButton
            name={user.name}
            email={user.email}
            picture={user.picture}
            teams={user.teams}
            hasTeamAccess={user.hasTeamAccess}
            notificationsCount={user.notificationsUnreadCount}
          />
        )}
      </div>
    </div>
  );
}

function MobileNavbar({ layout = 'default', className }: Props) {
  const user = useUser();

  return (
    <div
      className={cx('flex lg:hidden h-16 items-center justify-between px-4 lg:px-8', BG_COLOR, 'text-white', className)}
    >
      <MobileNavigation />

      <div className="flex lg:hidden">
        {user ? (
          <UserMenuButton
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
  );
}

function MobileNavigation() {
  const { t } = useTranslation();
  const eventPage = useRouteLoaderData('event-page');

  const { backPath, title } = useBackNavigation([
    { path: '/:event/survey', back: '/:event', title: t('event.nav.survey') },
    { path: '/:event/proposals', back: '/:event', title: t('event.nav.proposals') },
    { path: '/:event/submission/*', back: '/:event', title: t('event.nav.submit-proposal') },
    { path: '/:event/proposals/*', back: '/:event/proposals', title: 'Proposal' },
  ]);

  if (!eventPage) return <LogoButton />;

  return (
    <div className="flex items-center gap-4">
      <MobileBackButton to={backPath} />
      <Text weight="semibold" size="base" variant="light" className="flex items-center gap-4">
        {title ?? eventPage.name}
      </Text>
    </div>
  );
}
