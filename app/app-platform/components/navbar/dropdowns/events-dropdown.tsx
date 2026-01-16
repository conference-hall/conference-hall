import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, Link, useParams } from 'react-router';
import type { TeamRole } from '~/shared/authorization/types.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { menuItem, menuItemIcon, menuItems, menuSeparator } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { UserTeamPermissions } from '~/shared/authorization/team-permissions.ts';

const menuStyle = cx(
  'flex items-center gap-1',
  'cursor-pointer text-sm font-semibold whitespace-nowrap',
  'text-white hover:bg-gray-900 hover:text-white focus-visible:outline-white',
  'rounded-md px-3 py-2 focus-visible:outline-2',
);

type Props = {
  teams: Array<{
    slug: string;
    name: string;
    role: TeamRole;
    events: Array<{ slug: string; name: string; logoUrl: string | null; archived: boolean }>;
  }>;
};

export function EventsDropdown({ teams = [] }: Props) {
  const { t } = useTranslation();
  const { team, event } = useParams();

  const currentTeam = teams.find(({ slug }) => slug === team);
  const currentEvent = currentTeam?.events?.find(({ slug }) => slug === event);
  if (!currentTeam || !currentEvent) return null;

  const permissions = UserTeamPermissions.getPermissions(currentTeam.role);
  const eventsDisplayed = currentTeam?.events?.filter((event) => !event.archived || event.slug === currentEvent.slug);

  return (
    <Menu>
      <MenuButton className={menuStyle}>
        {({ open }) => (
          <>
            <Avatar
              size="xs"
              picture={currentEvent.logoUrl}
              name={currentEvent.name}
              square
              aria-hidden
              className="mr-2"
            />
            {currentEvent.name}
            {open ? (
              <ChevronUpIcon className="size-5 shrink-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
            ) : (
              <ChevronDownIcon className="size-5 shrink-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
            )}
          </>
        )}
      </MenuButton>

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom start', gap: '8px' }} className={menuItems()}>
          {eventsDisplayed.map(({ slug, name, logoUrl }) => (
            <MenuItem
              key={slug}
              as={Link}
              to={href('/team/:team/:event', { team: currentTeam.slug, event: slug })}
              className={cx(menuItem(), { 'font-semibold': slug === currentEvent.slug })}
            >
              <Avatar size="xs" picture={logoUrl} name={name} square aria-hidden />
              <span className="truncate">{name}</span>
              {slug === currentEvent.slug ? <StatusPill size="sm" /> : null}
            </MenuItem>
          ))}

          {permissions.canCreateEvent ? (
            <>
              <MenuSeparator className={menuSeparator()} />

              <MenuItem as={Link} to={href('/team/:team/new', { team: currentTeam.slug })} className={menuItem()}>
                <PlusIcon className={menuItemIcon()} aria-hidden="true" />
                {t('team.events-list.new-event-button')}
              </MenuItem>
            </>
          ) : null}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
