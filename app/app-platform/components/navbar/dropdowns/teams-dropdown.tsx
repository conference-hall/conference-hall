import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, Link } from 'react-router';
import { menuItem, menuItemIcon, menuItems, menuSeparator } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';

const menuStyle = cx(
  'flex items-center gap-1',
  'text-sm font-semibold whitespace-nowrap cursor-pointer',
  'text-gray-300 hover:bg-gray-900 hover:text-white focus-visible:outline-white',
  'px-3 py-2 rounded-md focus-visible:outline-2',
);

type Props = {
  currentTeam?: { slug: string; name: string };
  teams: Array<{ slug: string; name: string }>;
};

export function TeamsDropdown({ teams = [], currentTeam }: Props) {
  const { t } = useTranslation();
  return (
    <Menu>
      <MenuButton className={menuStyle}>
        {({ open }) => (
          <>
            {currentTeam ? currentTeam.name : t('navbar.teams')}
            {open ? (
              <ChevronUpIcon className="size-5 shrinl-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
            ) : (
              <ChevronDownIcon className="size-5 shrinl-0 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
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
