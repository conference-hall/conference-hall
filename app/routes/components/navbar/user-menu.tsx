import {
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  FireIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PlusIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Form, Link } from 'react-router';

import { Avatar, AvatarName } from '~/design-system/avatar.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Text } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';

import { LegalLinks } from '../footer.tsx';
import { SponsorLink } from '../sponsor-link.tsx';

type MenuProps = {
  email: string | null;
  name: string | null;
  picture: string | null;
  hasTeamAccess?: boolean;
  teams: Array<{ slug: string; name: string }>;
  notificationsCount: number;
};

export function UserMenu({ email, name, picture, hasTeamAccess, teams, notificationsCount }: MenuProps) {
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
            <ul className="relative flex-1 p-0.5">
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
                Talk library
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

              {hasTeamAccess ? (
                <MenuLink to="/team/new" icon={PlusIcon} onClick={handleClose}>
                  New team
                </MenuLink>
              ) : (
                <MenuLink to="/team/request" icon={Square3Stack3DIcon} onClick={handleClose}>
                  Become organizer
                </MenuLink>
              )}

              <Divider as="li" className="my-2" />

              <SignOutMenu />
            </ul>

            <div className="mt-4 space-y-4">
              <SponsorLink />
              <LegalLinks />
            </div>
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
  onClick: VoidFunction;
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

type OpenProps = { name: string | null; picture: string | null; notificationsCount: number; onClick: VoidFunction };

function OpenButton({ name, picture, notificationsCount, onClick }: OpenProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
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
  const handleSignout = async () => {
    const clientAuth = getClientAuth();
    await clientAuth.signOut();
  };

  return (
    <li>
      <Form method="POST" onSubmit={handleSignout} action="/auth/logout">
        <button
          type="submit"
          onClick={handleSignout}
          className="group flex items-center gap-x-3 w-full text-left rounded-md p-2 text-sm leading-6 font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
        >
          <ArrowRightStartOnRectangleIcon
            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
            aria-hidden="true"
          />
          Sign out
        </button>
      </Form>
    </li>
  );
}
