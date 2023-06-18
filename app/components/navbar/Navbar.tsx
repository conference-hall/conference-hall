import { Disclosure } from '@headlessui/react';

import { ButtonLink } from '~/design-system/Buttons';

import { Logo } from './Logo';
import { MobileMenuButton, MobileMenuPanel } from './NavbarMobileMenu';
import { Navigation } from './Navigation';
import { type Notification, NotificationsLink } from './NotificationsLink';
import { SearchEventsInput } from './SearchEventsInput';
import { UserMenuDesktop } from './UserMenuDesktop';

type Props = {
  user: {
    name: string | null;
    email: string | null;
    picture: string | null;
    notifications: Array<Notification>;
    isOrganizer: boolean;
    teams: Array<{ slug: string; name: string; role: string }>;
  } | null;
  withSearch?: boolean;
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

              {/* Notifications */}
              {user && <NotificationsLink notifications={user.notifications} />}

              {/* Avatar */}
              {user && (
                <UserMenuDesktop
                  name={user.name}
                  email={user.email}
                  picture={user.picture}
                  isOrganizer={user?.isOrganizer}
                />
              )}
            </div>

            {/* Mobile menu */}
            <div className="flex lg:hidden">
              {!user && <ButtonLink to="/login">Login</ButtonLink>}
              {user && <MobileMenuButton open={open} />}
            </div>
          </div>

          {/* Mobile panel */}
          {user && <MobileMenuPanel user={user} notifications={user.notifications} />}
        </>
      )}
    </Disclosure>
  );
}
