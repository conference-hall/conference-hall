import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { useMatch, useParams, useRouteLoaderData } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { BG_COLOR } from '~/design-system/colors.ts';
import { SlashBarIcon } from '~/design-system/icons/slash-bar-icon.tsx';
import { Text } from '~/design-system/typography.tsx';
import { useUser } from '../user-context.tsx';
import { BackButton, useBackNavigation } from './buttons/back-button.tsx';
import { EventCommandPaletteButton } from './buttons/event-command-palette-button.tsx';
import { LogoButton } from './buttons/logo-button.tsx';
import { UserMenuButton } from './buttons/user-menu-button.tsx';
import { EventsDropdown } from './dropdowns/events-dropdown.tsx';
import { TeamsDropdown } from './dropdowns/teams-dropdown.tsx';

export function NavbarTeam() {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
}

function DesktopNavbar() {
  const user = useUser();
  const { event } = useParams();

  if (!user) return null;

  return (
    <div className={cx('hidden lg:flex lg:h-16 lg:items-center lg:justify-between lg:px-8', BG_COLOR)}>
      <nav className="flex items-center">
        <LogoButton hideLabel className="mr-2" />
        <TeamsDropdown teams={user.teams} />
        {event ? <SlashBarIcon className="hidden sm:flex h-4 w-4 fill-gray-500" /> : null}
        {event ? <EventsDropdown teams={user.teams} /> : null}
      </nav>

      <div className="gap-4 flex shrink-0 items-center justify-end">
        <EventCommandPaletteButton />

        <UserMenuButton
          name={user.name}
          email={user.email}
          picture={user.picture}
          teams={user.teams}
          hasTeamAccess={user.hasTeamAccess}
          notificationsCount={user.notificationsUnreadCount}
        />
      </div>
    </div>
  );
}

function MobileNavbar() {
  const user = useUser();

  if (!user) return null;

  return (
    <div className={cx('flex h-16 items-center justify-between px-4 lg:hidden', BG_COLOR)}>
      <MobileNavigation />

      <UserMenuButton
        name={user.name}
        email={user.email}
        picture={user.picture}
        teams={user.teams}
        hasTeamAccess={user.hasTeamAccess}
        notificationsCount={user.notificationsUnreadCount}
      />
    </div>
  );
}

function MobileNavigation() {
  const { t } = useTranslation();
  const user = useUser();

  const isEventRoute = useMatch({ path: '/team/:team/:event/overview', end: true });
  const eventManagement = useRouteLoaderData('event-management');

  const isTeamRoute = useMatch({ path: '/team/:team', end: true });
  const currentTeam = useRouteLoaderData('team-management');

  const { backPath, title } = useBackNavigation([
    // team management routes
    { path: '/team/:team/settings/*', back: '/team/:team', title: t('common.settings') },
    // event management routes
    { path: '/team/:team/:event/reviews', back: '/team/:team/:event', title: t('event-management.nav.proposals') },
    {
      path: '/team/:team/:event/reviews/new',
      back: '/team/:team/:event/reviews',
      title: t('event-management.proposals.new.title'),
    },
    { path: '/team/:team/:event/reviews/*', back: '/team/:team/:event/reviews', title: t('common.review') },
    { path: '/team/:team/:event/speakers', back: '/team/:team/:event', title: t('event-management.nav.speakers') },
    {
      path: '/team/:team/:event/speakers/new',
      back: '/team/:team/:event/speakers',
      title: t('event-management.speakers.new.title'),
    },
    { path: '/team/:team/:event/speakers/*', back: '/team/:team/:event/speakers', title: t('common.speaker') },
    {
      path: '/team/:team/:event/publication',
      back: '/team/:team/:event',
      title: t('event-management.nav.publication'),
    },
    { path: '/team/:team/:event/settings/*', back: '/team/:team/:event', title: t('common.settings') },
  ]);

  if (isTeamRoute && user) {
    return (
      <nav className="flex items-center gap-2">
        <LogoButton hideLabel />
        <TeamsDropdown teams={user.teams} />
      </nav>
    );
  }

  if (isEventRoute && user) {
    return <EventsDropdown teams={user.teams} />;
  }

  return (
    <div className="flex items-center gap-4">
      <BackButton to={backPath} className="text-white" />

      {eventManagement?.event ? (
        <Avatar
          size="xs"
          picture={eventManagement?.event?.logoUrl}
          name={eventManagement?.event?.name}
          square
          aria-hidden
        />
      ) : null}

      <div>
        <Text size="xs" variant="secondary-light">
          {eventManagement?.event?.name || currentTeam?.name}
        </Text>
        <Text weight="semibold" size="base" variant="light">
          {title}
        </Text>
      </div>
    </div>
  );
}
