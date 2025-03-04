import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { Link } from 'react-router';
import { Fragment } from 'react/jsx-runtime';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';

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
  return (
    <Menu as="div" className="hidden sm:flex relative z-20 shrink-0">
      {({ open }) => (
        <>
          <MenuButton className={menuStyle}>
            {currentTeam ? currentTeam.name : 'My teams'}
            {open ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
            )}
          </MenuButton>
          <MenuTransition>
            <MenuItems anchor={{ to: 'bottom start', gap: '8px' }} className={menuItems()}>
              {teams.map((team) => (
                <MenuItem key={team.slug} as={Fragment}>
                  <Link
                    to={`/team/${team.slug}`}
                    className={cx(menuItem(), { 'font-semibold': team.slug === currentTeam?.slug })}
                  >
                    {team.name}
                  </Link>
                </MenuItem>
              ))}
              <MenuSeparator className="border-t border-gray-200" />
              <MenuItem>
                <Link to="/team/new" className={menuItem()}>
                  <PlusIcon className={menuItemIcon()} aria-hidden="true" />
                  New team
                </Link>
              </MenuItem>
            </MenuItems>
          </MenuTransition>
        </>
      )}
    </Menu>
  );
}
