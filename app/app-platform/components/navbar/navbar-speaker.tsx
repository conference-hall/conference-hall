import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { BG_COLOR } from '~/design-system/colors.ts';
import { Text } from '~/design-system/typography.tsx';
import { useUser } from '../user-context.tsx';
import { BackButton, useBackNavigation } from './buttons/back-button.tsx';
import { LoginButton } from './buttons/login-button.tsx';
import { LogoButton } from './buttons/logo-button.tsx';
import { UserMenuButton } from './buttons/user-menu-button.tsx';

export function NavbarSpeaker() {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
}

function DesktopNavbar() {
  const user = useUser();

  return (
    <div className={cx('hidden lg:flex lg:h-16 lg:items-center lg:justify-between lg:px-8', BG_COLOR)}>
      <LogoButton />

      {user ? (
        <UserMenuButton
          name={user.name}
          email={user.email}
          picture={user.picture}
          teams={user.teams}
          hasTeamAccess={user.hasTeamAccess}
          notificationsCount={user.notificationsUnreadCount}
        />
      ) : (
        <LoginButton />
      )}
    </div>
  );
}

function MobileNavbar() {
  const user = useUser();

  return (
    <div className={cx('flex h-16 items-center justify-between px-4 lg:hidden', BG_COLOR)}>
      <MobileNavigation />

      {user ? (
        <UserMenuButton
          name={user.name}
          email={user.email}
          picture={user.picture}
          teams={user.teams}
          hasTeamAccess={user.hasTeamAccess}
          notificationsCount={user.notificationsUnreadCount}
        />
      ) : (
        <LoginButton />
      )}
    </div>
  );
}

function MobileNavigation() {
  const { t } = useTranslation();
  const user = useUser();

  const { backPath, title } = useBackNavigation([
    { path: '/speaker', back: '/', title: t('speaker.nav.activity') },
    { path: '/speaker/talks', back: '/', title: t('speaker.nav.talks') },
    { path: '/speaker/talks/new', back: '/speaker/talks', title: t('talk.library.new') },
    { path: '/speaker/talks/*', back: '/speaker/talks', title: t('common.talk') },
    { path: '/speaker/settings/*', back: '/', title: t('speaker.nav.settings') },
    { path: '/notifications', back: '/', title: t('navbar.user-menu.notifications') },
    { path: '/*', back: '/' },
  ]);

  return (
    <div className="flex items-center gap-4">
      <BackButton to={backPath} className="text-white" />

      <div>
        <Text size="xs" variant="secondary-light">
          {user?.name}
        </Text>
        <Text weight="semibold" size="base" variant="light">
          {title}
        </Text>
      </div>
    </div>
  );
}
