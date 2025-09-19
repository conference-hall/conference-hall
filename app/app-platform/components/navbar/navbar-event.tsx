import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { useRouteLoaderData } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { BG_COLOR } from '~/design-system/colors.ts';
import { Text } from '~/design-system/typography.tsx';
import { useUser } from '../user-context.tsx';
import { BackButton, useBackNavigation } from './buttons/back-button.tsx';
import { LoginButton } from './buttons/login-button.tsx';
import { LogoButton } from './buttons/logo-button.tsx';
import { UserMenuButton } from './buttons/user-menu-button.tsx';

export function NavbarEvent() {
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
  const eventPage = useRouteLoaderData('event-page');

  const { backPath, title } = useBackNavigation([
    { path: '/:event/survey', back: '/:event', title: t('event.nav.survey') },
    { path: '/:event/proposals', back: '/:event', title: t('event.nav.proposals') },
    { path: '/:event/submission/*', back: '/:event', title: t('event.nav.submit-proposal') },
    { path: '/:event/proposals/*', back: '/:event/proposals', title: 'Proposal' }, // todo(mobile): set a label
    { path: '/*', back: '/' },
  ]);

  if (!eventPage) return <LogoButton />;

  return (
    <div className="flex items-center gap-4">
      <BackButton to={backPath} className="text-white" />

      <Avatar size="xs" picture={eventPage.logoUrl} name={eventPage.name} square aria-hidden />

      <div>
        {title ? (
          <Text size="xs" variant="secondary-light">
            {eventPage.name}
          </Text>
        ) : null}

        <Text weight="semibold" size="base" variant="light">
          {title ?? eventPage.name}
        </Text>
      </div>
    </div>
  );
}
