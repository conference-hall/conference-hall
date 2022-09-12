import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import { Form, Link } from '@remix-run/react';
import {
  Cog6ToothIcon,
  FireIcon,
  ArrowRightOnRectangleIcon,
  MicrophoneIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/20/solid';
import { getAuth } from 'firebase/auth';
import { Avatar } from '~/design-system/Avatar';

type Props = { email?: string | null; picture?: string | null };

type MenuItemProps = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

function MenuItem({ to, icon: Icon, label }: MenuItemProps) {
  return (
    <Menu.Item>
      {({ active }) => (
        <Link
          to={to}
          className={cn('group flex items-center px-4 py-2 text-sm text-gray-700', {
            'bg-gray-100 text-gray-900': active,
          })}
        >
          <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
          {label}
        </Link>
      )}
    </Menu.Item>
  );
}

export function UserMenu({ email, picture }: Props) {
  return (
    <Menu as="div" className="relative z-30 ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <span className="sr-only">Open user menu</span>
          <Avatar photoURL={picture} />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-900">{email}</p>
          </div>
          <div className="py-1">
            <MenuItem to="/" label="Search events" icon={MagnifyingGlassIcon} />
          </div>
          <div className="py-1">
            <MenuItem to="/speaker" label="Activity" icon={FireIcon} />
            <MenuItem to="/speaker/talks" label="Your talks" icon={MicrophoneIcon} />
            <MenuItem to="/speaker/settings" label="Settings" icon={Cog6ToothIcon} />
          </div>
          <div className="py-1">
            <MenuItem to="/organizer" label="Your organizations" icon={BuildingOfficeIcon} />
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Form action="/logout" method="post">
                  <button
                    type="submit"
                    onClick={() => getAuth().signOut()}
                    className={cn('block w-full px-4 py-2 text-left text-sm text-gray-700', { 'bg-gray-100': active })}
                  >
                    <ArrowRightOnRectangleIcon
                      className="mr-3 inline h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Sign out
                  </button>
                </Form>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
