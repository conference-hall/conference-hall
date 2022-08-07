import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import { Form, Link } from '@remix-run/react';
import { CogIcon, FireIcon, LogoutIcon, MicrophoneIcon, SearchIcon } from '@heroicons/react/solid';
import { getAuth } from 'firebase/auth';

type Props = { email: string | null; picture: string | null };

export function UserMenu({ email, picture }: Props) {
  return (
    <Menu as="div" className="relative z-20 ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <span className="sr-only">Open user menu</span>
          <img
            className="h-8 w-8 rounded-full"
            src={picture || 'http://placekitten.com/100/100'}
            alt=""
            aria-hidden="true"
          />
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
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/speaker"
                  className={cn('group flex items-center px-4 py-2 text-sm text-gray-700', {
                    'bg-gray-100 text-gray-900': active,
                  })}
                >
                  <FireIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Activity
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/speaker/talks"
                  className={cn('group flex items-center px-4 py-2 text-sm text-gray-700', {
                    'bg-gray-100 text-gray-900': active,
                  })}
                >
                  <MicrophoneIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Talks
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/speaker/settings"
                  className={cn('group flex items-center px-4 py-2 text-sm text-gray-700', {
                    'bg-gray-100 text-gray-900': active,
                  })}
                >
                  <CogIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Settings
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/"
                  className={cn('group flex items-center px-4 py-2 text-sm text-gray-700', {
                    'bg-gray-100 text-gray-900': active,
                  })}
                >
                  <SearchIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Search events
                </Link>
              )}
            </Menu.Item>
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
                    <LogoutIcon
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
