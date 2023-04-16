import { type Notification, NotificationsLink } from './NotificationsLink';
import { UserMenuDesktop } from './UserMenuDesktop';
import { ButtonLink } from '~/design-system/Buttons';
import { SearchEventsInput } from './SearchEventsInput';
import { Disclosure } from '@headlessui/react';
import { MobileMenuButton, MobileMenuPanel } from './NavbarMobileMenu';
import { Navigation } from './Navigation';
import { Logo } from './Logo';

type Props = {
  user: {
    name: string | null;
    email: string | null;
    photoURL: string | null;
    notifications: Array<Notification>;
    isOrganizer: boolean;
    organizations: Array<{ slug: string; name: string; role: string }>;
  } | null;
  withSearch?: boolean;
};

export function Navbar({ user, withSearch }: Props) {
  return (
    <Disclosure as="div" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="flex h-16 items-center justify-between px-4 sm:px-8">
            <div className="flex w-full items-center">
              {/* Logo */}
              <Logo />

              {/* Search */}
              {withSearch && <SearchEventsInput />}
            </div>

            <div className="hidden gap-2 lg:flex lg:items-center lg:justify-end">
              {/* Navigation links */}
              <Navigation
                authenticated={Boolean(user)}
                isOrganizer={user?.isOrganizer}
                organizations={user?.organizations}
              />

              {/* Notifications */}
              {user && <NotificationsLink notifications={user.notifications} />}

              {/* Avatar */}
              {user && (
                <UserMenuDesktop
                  name={user.name}
                  email={user.email}
                  picture={user.photoURL}
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
