import { Link as RemixLink } from '@remix-run/react';
import { type Notification, NotificationMenu } from './NotificationMenu';
import { UserMenuDesktop } from './UserMenuDesktop';
import { ButtonLink } from '~/design-system/Buttons';
import { SearchEventsInput } from './SearchEventsInput';
import { Disclosure } from '@headlessui/react';
import { Container } from '~/design-system/Container';
import { MobileMenuButton, MobileMenuPanel } from './NavbarMobileMenu';

type Props = {
  user: { name: string | null; email: string | null; photoURL: string | null } | null;
  notifications: Array<Notification> | null;
  withSearch?: boolean;
};

export function Navbar({ user, notifications, withSearch }: Props) {
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <Container>
            <div className="flex h-16 items-center justify-between">
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
              {/* Desktop menu */}
              <div className="hidden items-center gap-4 pr-2 sm:static sm:inset-auto sm:pr-0 lg:flex">
                {!user && <ButtonLink to="/login">Login</ButtonLink>}
                {user && (
                  <div className="flex items-center gap-2">
                    <NotificationMenu notifications={notifications} />
                    <UserMenuDesktop name={user.name} email={user.email} picture={user.photoURL} />
                  </div>
                )}
              </div>
              {/* Mobile menu */}
              <div className="flex lg:hidden">
                {!user && <ButtonLink to="/login">Login</ButtonLink>}
                {user && <MobileMenuButton open={open} />}
              </div>
            </div>
          </Container>
          {/* Mobile panel */}
          {user && <MobileMenuPanel user={user} notifications={notifications} />}
        </>
      )}
    </Disclosure>
  );
}
