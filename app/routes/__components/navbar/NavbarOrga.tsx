import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { Link, useRouteLoaderData } from '@remix-run/react';
import { useMemo } from 'react';

import { Avatar } from '~/design-system/Avatar.tsx';
import { ButtonLink } from '~/design-system/Buttons.tsx';
import { NavTabs } from '~/design-system/navigation/NavTabs.tsx';

import type { loader as routeTeamLoader } from '../../team+/$team';
import type { loader as routeEventLoader } from '../../team+/$team.$event+/_layout';
import { Logo } from './Logo.tsx';
import { UserMenu } from './UserMenu.tsx';

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

        <div className="hidden gap-2 lg:flex lg:flex-shrink-0 lg:items-center lg:justify-end">
          {/* Navigation */}
          <Navigation authenticated={!!user} />

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
          {!user && <ButtonLink to="/login">Login</ButtonLink>}
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
    <nav className="ml-6 flex items-center gap-2 text-gray-200 text-sm font-semibold">
      <ul className="flex gap-2 text-sm">
        {teams
          .filter((team) => team.slug === currentTeam.slug)
          .map((team) => (
            <li key={team.slug}>
              <Link to={`/team/${currentTeam.slug}`} className="flex gap-2 text-gray-50 items-center hover:underline">
                {team.name}
              </Link>
            </li>
          ))}
      </ul>
      {event && (
        <>
          <ChevronRightIcon className="h-4 w-4" />
          <Link
            to={`/team/${currentTeam.slug}/${event.slug}`}
            className="flex gap-2 text-gray-50 items-center font-bold hover:underline"
          >
            <Avatar size="xs" picture={event.logo} name={event.name} square aria-hidden />
            <span>{event.name}</span>
          </Link>
        </>
      )}
    </nav>
  );
}

type NavigationProps = { authenticated: boolean };

function Navigation({ authenticated }: NavigationProps) {
  const tabs = useMemo(() => {
    if (!authenticated) {
      return [{ label: 'Login', to: '/login', enabled: true }];
    }
    return [];
  }, [authenticated]);

  return <NavTabs tabs={tabs} variant="dark" />;
}
