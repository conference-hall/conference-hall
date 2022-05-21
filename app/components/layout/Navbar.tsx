import { Link } from '@remix-run/react';
import { AuthUser } from '../../features/auth/auth.server';
import { UserAvatar } from './UserAvatar';

type NavbarProps = { user?: AuthUser }

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                alt="Workflow"
              />
            </div>
            <div className="ml-4 font-sans text-lg font-bold text-gray-800">
              <Link to="/">Conference Hall</Link>
            </div>
          </div>
          <div className="flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {user ? <UserAvatar email={user.email} picture={user.picture}/> : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
