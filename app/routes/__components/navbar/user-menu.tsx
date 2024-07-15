import {
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  FireIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PlusIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { Link, useFetcher } from '@remix-run/react';
import { useState } from 'react';

import { Avatar, AvatarName } from '~/design-system/avatar.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Text } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import type { action as LogoutAction } from '~/routes/auth+/logout.tsx';

import { LegalLinks } from '../footer.tsx';

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

      <SlideOver open={open} onClose={handleClose} size="s">
        <SlideOver.Content
          title={<AvatarName picture={picture} name={name} subtitle={email} size="s" />}
          onClose={handleClose}
        >
          <nav aria-label="User navigation" className="flex h-full flex-col overflow-y-auto">
            <ul className="relative flex-1">
              <MenuLink to="/" icon={MagnifyingGlassIcon} onClick={handleClose}>
                Search events
              </MenuLink>

              <MenuLink to="/notifications" icon={BellIcon} count={notificationsCount} onClick={handleClose}>
                Notifications
              </MenuLink>

              <Divider as="li" className="my-2" />

              <li className="px-2 pb-2">
                <Text size="xs" weight="semibold" variant="secondary">
                  Speaker
                </Text>
              </li>

              <MenuLink to="/speaker" icon={FireIcon} onClick={handleClose}>
                Activity
              </MenuLink>

              <MenuLink to="/speaker/talks" icon={MicrophoneIcon} onClick={handleClose}>
                Talks library
              </MenuLink>

              <Divider as="li" className="my-2" />

              {teams.length >= 0 && (
                <li className="px-2 pb-2">
                  <Text size="xs" weight="semibold" variant="secondary">
                    Teams
                  </Text>
                </li>
              )}

              {teams.map((team) => (
                <MenuLink key={team.slug} to={`/team/${team.slug}`} icon={Square3Stack3DIcon} onClick={handleClose}>
                  {team.name}
                </MenuLink>
              ))}

              {!isOrganizer ? (
                <MenuLink to="/team/request" icon={Square3Stack3DIcon} onClick={handleClose}>
                  Become organizer
                </MenuLink>
              ) : (
                <MenuLink to="/team/new" icon={PlusIcon} onClick={handleClose}>
                  New team
                </MenuLink>
              )}

              <Divider as="li" className="my-2" />

              <SignOutMenu />
            </ul>

            <LegalLinks />
          </nav>
        </SlideOver.Content>
      </SlideOver>
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
        {count && count > 0 ? (
          <>
            <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
            <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200">
              {count}
            </span>
          </>
        ) : null}
      </Link>
    </li>
  );
}

type OpenProps = { name: string | null; picture: string | null; notificationsCount: number; onClick: () => void };

function OpenButton({ name, picture, notificationsCount, onClick }: OpenProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-shrink-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
    >
      <Avatar picture={picture} name={name} size="s" />
      <span className="sr-only">Open user menu</span>
      {notificationsCount > 0 && (
        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-gray-800" />
      )}
    </button>
  );
}

function SignOutMenu() {
  const fetcher = useFetcher<typeof LogoutAction>();

  const handleSignout = () => {
    const clientAuth = getClientAuth();
    clientAuth.signOut().then(() => {
      fetcher.submit({ intent: 'signout' });
    });
  };

  return (
    <li>
      <fetcher.Form method="POST" action="/auth/logout">
        <button
          onClick={handleSignout}
          className="group flex items-center gap-x-3 w-full text-left rounded-md p-2 text-sm leading-6 font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
        >
          <ArrowRightStartOnRectangleIcon
            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
            aria-hidden="true"
          />
          Sign out
        </button>
      </fetcher.Form>
    </li>
  );
}
