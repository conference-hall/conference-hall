import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import { Form, Link } from '@remix-run/react';
import { CogIcon, FireIcon, LogoutIcon, MicrophoneIcon, SearchIcon } from '@heroicons/react/solid';

type Props = { email: string; picture?: string | null };

export function UserMenu({ email, picture }: Props) {
  return (
    <Menu as="div" className="ml-3 relative z-20">
      <div>
        <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
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
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
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
                    className={cn('block px-4 py-2 text-sm text-gray-700 w-full text-left', { 'bg-gray-100': active })}
                  >
                    <LogoutIcon
                      className="inline mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
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
