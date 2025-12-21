import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, Link, useParams } from 'react-router';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
import { menuItem, menuItemIcon, menuItems, menuSeparator } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';

const menuStyle = cx(
  'flex items-center gap-1',
  'cursor-pointer whitespace-nowrap font-semibold text-sm',
  'text-white hover:bg-gray-900 hover:text-white focus-visible:outline-white',
  'rounded-md px-3 py-2 focus-visible:outline-2',
);

type Props = {
  teams: Array<{ slug: string; name: string }>;
};

export function TeamsDropdown({ teams = [] }: Props) {
  const { t } = useTranslation();
  const { team } = useParams();

  const currentTeam = teams.find(({ slug }) => slug === team);

  return (
    <Menu>
      <MenuButton className={menuStyle}>
        {({ open }) => (
          <>
            {currentTeam ? currentTeam.name : t('navbar.teams')}
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
          {teams.map((team) => (
            <MenuItem
              key={team.slug}
              as={Link}
              to={href('/team/:team', { team: team.slug })}
              className={cx(menuItem(), { 'font-semibold': team.slug === currentTeam?.slug })}
            >
              <span className="truncate">{team.name}</span>
              {team.slug === currentTeam?.slug ? <StatusPill size="sm" /> : null}
            </MenuItem>
          ))}

          <MenuSeparator className={menuSeparator()} />

          <MenuItem as={Link} to={href('/team/new')} className={menuItem()}>
            <PlusIcon className={menuItemIcon()} aria-hidden="true" />
            {t('navbar.teams.create')}
          </MenuItem>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
