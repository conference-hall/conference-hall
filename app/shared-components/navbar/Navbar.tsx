import { Link as RemixLink } from '@remix-run/react';
import { type Notification, NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';
import { ButtonLink } from '~/design-system/Buttons';
import { SearchEventsInput } from './SearchEventsInput';

type Props = {
  user: { email: string | null; photoURL: string | null } | null;
  notifications: Array<Notification> | null;
  withSearch?: boolean;
};

export function Navbar({ user, notifications, withSearch }: Props) {
  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <RemixLink to="/" className="flex-shrink-0">
              <img
                className="h-8 w-8"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo-300.svg"
                aria-hidden
                alt=""
              />
            </RemixLink>
          </div>
          {withSearch && <SearchEventsInput />}
          <div className="flex items-center gap-4 pr-2 sm:static sm:inset-auto sm:pr-0">
            {!user && <ButtonLink to="/login">Login</ButtonLink>}
            {user && (
              <div className="flex items-center gap-2">
                <NotificationMenu notifications={notifications} />
                <UserMenu email={user.email} picture={user.photoURL} />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
