import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  FireIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PlusIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, Link, useSubmit } from 'react-router';
import { Avatar, AvatarName } from '~/design-system/avatar.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { Text } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/shared/authentication/firebase.ts';
import { LegalLinks } from '../../footer.tsx';
import { SponsorLink } from '../../sponsor-link.tsx';

type MenuProps = {
  email: string | null;
  name: string | null;
  picture: string | null;
  hasTeamAccess?: boolean;
  teams: Array<{ slug: string; name: string }>;
  notificationsCount: number;
};

export function UserMenuButton({ email, name, picture, hasTeamAccess, teams, notificationsCount }: MenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <OpenButton name={name} picture={picture} notificationsCount={notificationsCount} onClick={handleOpen} />

      <SlideOver
        title={<AvatarName picture={picture} name={name} subtitle={email} size="s" />}
        open={open}
        withBorder={false}
        onClose={handleClose}
        size="s"
      >
        <SlideOver.Content>
          <nav aria-label={t('navbar.user-menu')} className="flex h-full flex-col overflow-y-auto">
            <ul className="relative flex-1 p-0.5">
              <MenuLink to={href('/')} icon={MagnifyingGlassIcon} onClick={handleClose}>
                {t('navbar.user-menu.search')}
              </MenuLink>
              <MenuLink to={href('/notifications')} icon={BellIcon} count={notificationsCount} onClick={handleClose}>
                {t('navbar.user-menu.notifications')}
              </MenuLink>

              <Divider as="li" className="mt-4 mb-2" />

              <li className="px-2 pb-2">
                <Text size="xs" weight="semibold" variant="secondary">
                  {t('navbar.user-menu.speaker')}
                </Text>
              </li>

              <MenuLink to={href('/speaker')} icon={FireIcon} onClick={handleClose}>
                {t('speaker.nav.activity')}
              </MenuLink>
              <MenuLink to={href('/speaker/talks')} icon={MicrophoneIcon} onClick={handleClose}>
                {t('speaker.nav.talks')}
              </MenuLink>
              <MenuLink to={href('/speaker/settings')} icon={Cog6ToothIcon} onClick={handleClose}>
                {t('speaker.nav.settings')}
              </MenuLink>

              <Divider as="li" className="mt-4 mb-2" />

              {teams.length >= 0 && (
                <li className="px-2 pb-2">
                  <Text size="xs" weight="semibold" variant="secondary">
                    {t('navbar.user-menu.teams')}
                  </Text>
                </li>
              )}

              {teams.map((team) => (
                <MenuLink
                  key={team.slug}
                  to={href('/team/:team', { team: team.slug })}
                  icon={Square3Stack3DIcon}
                  onClick={handleClose}
                >
                  {team.name}
                </MenuLink>
              ))}

              {hasTeamAccess ? (
                <MenuLink to={href('/team/new')} icon={PlusIcon} onClick={handleClose}>
                  {t('navbar.user-menu.create-team')}
                </MenuLink>
              ) : (
                <MenuLink to={href('/team/request')} icon={Square3Stack3DIcon} onClick={handleClose}>
                  {t('navbar.user-menu.request-team')}
                </MenuLink>
              )}

              <Divider as="li" className="mt-4 mb-2" />

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
        className="group flex items-center gap-x-2 rounded-md p-2 font-medium text-gray-700 text-sm leading-6 hover:bg-gray-100"
        onClick={onClick}
      >
        <Icon className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
        {children}
        {count && count > 0 ? (
          <>
            <span className="size-2 rounded-full bg-red-400" aria-hidden="true" />
            <span className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center font-medium text-gray-600 text-xs leading-5 ring-1 ring-gray-200 ring-inset">
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
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full p-0.5 text-sm hover:bg-gray-900 hover:text-white focus:outline-2 focus:outline-white focus:outline-offset-1"
    >
      <div className="flex items-center gap-1">
        <div className="relative">
          <Avatar picture={picture} name={name} size="s" />
          {notificationsCount > 0 && (
            <span className="absolute right-0 bottom-0 block size-2 rounded-full bg-red-400 ring-2 ring-gray-800" />
          )}
        </div>
        <ChevronDownIcon className="mr-0.5 hidden h-5 w-5 shrink-0 text-gray-400 lg:block" />
        <span className="sr-only">{t('navbar.user-menu.open')}</span>
      </div>
    </button>
  );
}

function SignOutMenu() {
  const { t } = useTranslation();
  const submit = useSubmit();
  const signOut = async () => {
    try {
      await getClientAuth().signOut();
    } finally {
      await submit({}, { method: 'POST', action: href('/auth/logout') });
    }
  };

  return (
    <li>
      <button
        type="submit"
        onClick={signOut}
        className="group flex w-full cursor-pointer items-center gap-x-3 rounded-md p-2 text-left font-medium text-gray-700 text-sm leading-6 hover:bg-gray-100"
      >
        <ArrowRightStartOnRectangleIcon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
        {t('navbar.user-menu.sign-out')}
      </button>
    </li>
  );
}
