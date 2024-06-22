import { ButtonLink } from '~/design-system/buttons.tsx';

import { Logo } from './logo.tsx';
import { Navigation } from './navigation.tsx';
import { SearchEventsInput } from './search-events-input.tsx';
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
  withSearch?: boolean;
};

export type Notification = {
  type: string;
  proposal: { id: string; title: string };
  event: { slug: string; name: string };
};

export function Navbar({ user, withSearch }: Props) {
  return (
    <div className="bg-gray-800">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex w-full items-center">
          {/* Logo */}
          <Logo displayName={!withSearch} />

          {/* Search */}
          {withSearch && <SearchEventsInput />}
        </div>

        <div className="hidden gap-4 lg:flex lg:flex-shrink-0 lg:items-center lg:justify-end">
          {/* Navigation links */}
          <Navigation authenticated={Boolean(user)} teams={user?.teams} showTeams={user?.isOrganizer} />

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
