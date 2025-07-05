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
import { getClientAuth } from '~/shared/auth/firebase.ts';
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

              <Divider as="li" className="mb-2 mt-4" />

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

              <Divider as="li" className="mb-2 mt-4" />

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

              <Divider as="li" className="mb-2 mt-4" />

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
        className="group flex items-center gap-x-2 rounded-md p-2 text-sm leading-6 font-medium text-gray-700 hover:bg-gray-100"
        onClick={onClick}
      >
        <Icon className="size-5 shrink-0 text-gray-500" aria-hidden="true" />
        {children}
        {count && count > 0 ? (
          <>
            <span className="size-2 rounded-full bg-red-400" aria-hidden="true" />
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
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
    >
      <Avatar picture={picture} name={name} size="s" />
      <span className="sr-only">{t('navbar.user-menu.open')}</span>
      {notificationsCount > 0 && (
        <span className="absolute bottom-0 right-0 block size-2 rounded-full bg-red-400 ring-2 ring-gray-800" />
      )}
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
        className="group flex items-center gap-x-3 w-full text-left rounded-md p-2 text-sm leading-6 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
      >
        <ArrowRightStartOnRectangleIcon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
        {t('navbar.user-menu.sign-out')}
      </button>
    </li>
  );
}
