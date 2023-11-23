import { Disclosure } from '@headlessui/react';

import { ButtonLink } from '~/design-system/Buttons.tsx';

import { Logo } from './Logo.tsx';
import { Navigation } from './Navigation.tsx';
import { SearchEventsInput } from './SearchEventsInput.tsx';
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
  withSearch?: boolean;
};

export type Notification = {
  type: string;
  proposal: { id: string; title: string };
  event: { slug: string; name: string };
};

export function Navbar({ user, withSearch }: Props) {
  return (
    <Disclosure as="div" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex w-full items-center">
              {/* Logo */}
              <Logo displayName={!withSearch} />

              {/* Search */}
              {withSearch && <SearchEventsInput />}
            </div>

            <div className="hidden gap-2 lg:flex lg:flex-shrink-0 lg:items-center lg:justify-end">
              {/* Navigation links */}
              <Navigation authenticated={Boolean(user)} isOrganizer={user?.isOrganizer} teams={user?.teams} />

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
        </>
      )}
    </Disclosure>
  );
}
