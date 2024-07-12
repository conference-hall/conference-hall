import { useRouteLoaderData } from '@remix-run/react';

import { SlashBarIcon } from '~/design-system/icons/slash-bar-icon.tsx';

import type { loader as routeEventLoader } from '../../team+/$team.$event+/_layout.tsx';
import type { loader as routeTeamLoader } from '../../team+/$team.tsx';
import { EventButton } from './dropdowns/event-button.tsx';
import { LoginButton } from './dropdowns/login-button.tsx';
import { TeamsDropdown } from './dropdowns/teams-dropdown.tsx';
import { Logo } from './logo.tsx';
import { Navigation } from './navigation.tsx';
import { UserMenu } from './user-menu.tsx';

type Props = {
  user: {
    name: string | null;
    email: string | null;
    picture: string | null;
    isOrganizer: boolean;
    notificationsUnreadCount: number;
    teams: Array<{ slug: string; name: string }>;
  } | null;
};

export type Notification = {
  type: string;
  proposal: { id: string; title: string };
  event: { slug: string; name: string };
};

export function NavbarOrga({ user }: Props) {
  return (
    <div className="bg-gray-800">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex w-full items-center">
          {/* Logo */}
          <Logo displayName={false} />

          {/* Teams breadcrumb */}
          {user?.isOrganizer ? <TeamBreadcrumb teams={user.teams} /> : null}
        </div>

        <div className="hidden gap-4 lg:flex lg:flex-shrink-0 lg:items-center lg:justify-end">
          {/* Navigation links */}
          <Navigation authenticated={Boolean(user)} />

          {/* Avatar */}
          {user && (
            <UserMenu
              name={user.name}
              email={user.email}
              picture={user.picture}
              teams={user.teams}
              isOrganizer={user.isOrganizer}
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
              isOrganizer={user.isOrganizer}
              notificationsCount={user.notificationsUnreadCount}
            />
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </div>
  );
}

type TeamBreadcrumbProps = {
  teams: Array<{ slug: string; name: string }>;
};

function TeamBreadcrumb({ teams }: TeamBreadcrumbProps) {
  const currentTeam = useRouteLoaderData<typeof routeTeamLoader>('routes/team+/$team');
  const event = useRouteLoaderData<typeof routeEventLoader>('routes/team+/$team.$event+/_layout');

  return (
    <nav className="flex ml-4 items-center text-gray-200 text-sm font-semibold">
      <TeamsDropdown teams={teams} currentTeamSlug={currentTeam.slug} />
      {event && (
        <>
          <SlashBarIcon className="hidden sm:flex h-4 w-4 fill-gray-500" />
          <EventButton currentTeamSlug={currentTeam.slug} event={event} />
        </>
      )}
    </nav>
  );
}
