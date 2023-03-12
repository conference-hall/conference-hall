import { Link as RemixLink } from '@remix-run/react';
import { Link } from '../../design-system/Links';
import { type Notification, NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';

type Props = {
  user: { email: string | null; photoURL: string | null } | null;
  notifications: Array<Notification> | null;
};

export function Navbar({ user, notifications }: Props) {
  return (
    <nav className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                alt="Workflow"
              />
            </div>
            <div className="ml-4 font-sans text-lg font-bold text-gray-800">
              <RemixLink to="/">Conference Hall</RemixLink>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Link to="/about">About</Link>
            {user ? (
              <>
                <NotificationMenu notifications={notifications} />
                <UserMenu email={user.email} picture={user.photoURL} />
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
