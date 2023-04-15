import type { ReactNode } from 'react';
import { Link as RemixLink } from '@remix-run/react';
import { type Notification, NotificationMenu } from './NotificationMenu';
import { UserMenuDesktop } from './UserMenuDesktop';
import { ButtonLink } from '~/design-system/Buttons';
import { SearchEventsInput } from './SearchEventsInput';
import { Disclosure } from '@headlessui/react';
import { MobileMenuButton, MobileMenuPanel } from './NavbarMobileMenu';
import { NavTabs } from '~/design-system/navigation/NavTabs';

type Props = {
  user: {
    name: string | null;
    email: string | null;
    photoURL: string | null;
    notifications: Array<Notification>;
  } | null;
  children?: ReactNode;
  withSearch?: boolean;
};

export function Navbar({ user, children, withSearch }: Props) {
  return (
    <Disclosure as="div" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex w-full items-center">
              {/* Logo */}
              <RemixLink to="/" className="flex-shrink-0">
                <img
                  className="h-8 w-8"
                  src="https://tailwindui.com/img/logos/workflow-mark-indigo-300.svg"
                  aria-hidden
                  alt=""
                />
              </RemixLink>

              {/* Search */}
              {withSearch && <SearchEventsInput />}
            </div>

            <div className="hidden w-full items-center justify-end gap-2 pr-2 sm:pr-0 lg:flex">
              {/* Non authenticated menu */}
              {!user && <NavTabs tabs={[{ label: 'Login', to: '/login', enabled: true }]} variant="dark" />}

              {/* Authenticated menu */}
              {user && children && (
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">{children}</div>
                </div>
              )}

              {/* Notifications menu */}
              {user && <NotificationMenu notifications={user.notifications} />}

              {/* User menu */}
              {user && <UserMenuDesktop name={user.name} email={user.email} picture={user.photoURL} />}
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
