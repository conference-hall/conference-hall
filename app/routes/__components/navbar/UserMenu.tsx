import { Dialog, Transition } from '@headlessui/react';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PlusIcon,
  Square3Stack3DIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link } from '@remix-run/react';
import { Fragment, useState } from 'react';

import { Avatar, AvatarName } from '~/design-system/Avatar.tsx';
import { Text } from '~/design-system/Typography.tsx';

type MenuProps = {
  email: string | null;
  name: string | null;
  picture: string | null;
  teams: Array<{ slug: string; name: string }>;
  isOrganizer?: boolean;
  notificationsCount: number;
};

export function UserMenu({ email, name, picture, teams, isOrganizer, notificationsCount }: MenuProps) {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <OpenButton name={name} picture={picture} notificationsCount={notificationsCount} onClick={handleOpen} />

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={setOpen}>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-20 transition-opacity" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                  <nav
                    aria-label="User navigation"
                    className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl"
                  >
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <AvatarName picture={picture} name={name} subtitle={email} size="s" />
                        <CloseButton onClick={handleClose} />
                      </div>
                    </div>

                    <ul className="relative mt-6 flex-1 px-4">
                      <MenuLink to="/" icon={MagnifyingGlassIcon} onClick={handleClose}>
                        Search events
                      </MenuLink>

                      <Divider />

                      <MenuLink to="/speaker" icon={HomeIcon} onClick={handleClose}>
                        Home
                      </MenuLink>

                      <MenuLink to="/speaker/talks" icon={MicrophoneIcon} onClick={handleClose}>
                        Talks library
                      </MenuLink>

                      <MenuLink to="/speaker/profile" icon={UserIcon} onClick={handleClose}>
                        Profile
                      </MenuLink>

                      <MenuLink to="/notifications" icon={BellIcon} count={notificationsCount} onClick={handleClose}>
                        Notifications
                      </MenuLink>

                      <Divider />

                      {teams.length >= 0 && (
                        <li className="px-2 pb-2">
                          <Text size="xs" weight="semibold" variant="secondary">
                            Teams
                          </Text>
                        </li>
                      )}

                      {teams.map((team) => (
                        <MenuLink
                          key={team.slug}
                          to={`/team/${team.slug}`}
                          icon={Square3Stack3DIcon}
                          onClick={handleClose}
                        >
                          {team.name}
                        </MenuLink>
                      ))}

                      {!isOrganizer ? (
                        <MenuLink to="/team" icon={Square3Stack3DIcon} onClick={handleClose}>
                          Become organizer
                        </MenuLink>
                      ) : (
                        <MenuLink to="/team" icon={PlusIcon} onClick={handleClose}>
                          New team
                        </MenuLink>
                      )}

                      <Divider />

                      <MenuLink to="/logout" icon={ArrowRightOnRectangleIcon} onClick={handleClose}>
                        Sign out
                      </MenuLink>
                    </ul>
                  </nav>
                </Dialog.Panel>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

type LinkProps = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  onClick: () => void;
  children: string;
};

function MenuLink({ to, icon: Icon, count, onClick, children }: LinkProps) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
        onClick={onClick}
      >
        <Icon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600" aria-hidden="true" />
        {children}
        {count && count > 0 && (
          <>
            <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
            <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200">
              {count}
            </span>
          </>
        )}
      </Link>
    </li>
  );
}

function Divider() {
  return <li role="presentation" aria-hidden="true" className="border-t border-gray-200 my-2" />;
}

type OpenProps = { name: string | null; picture: string | null; notificationsCount: number; onClick: () => void };

function OpenButton({ name, picture, notificationsCount, onClick }: OpenProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-shrink-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
    >
      <Avatar picture={picture} name={name} size="s" />
      {notificationsCount > 0 && (
        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-gray-800" />
      )}
    </button>
  );
}

type CloseProps = { onClick: () => void };

function CloseButton({ onClick }: CloseProps) {
  return (
    <div className="ml-3 flex h-7 items-center">
      <button
        type="button"
        className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={onClick}
      >
        <span className="absolute -inset-2.5" />
        <span className="sr-only">Close user navigation</span>
        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
