import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react/jsx-runtime';

import { MenuTransition } from '~/design-system/transitions.tsx';

const menuStyle = cx(
  'flex items-center gap-1',
  'text-sm font-semibold whitespace-nowrap',
  'text-gray-300 hover:bg-gray-700 hover:text-white focus-visible:outline-white',
  'px-3 py-2 rounded-md focus-visible:outline focus-visible:outline-2',
);

const itemStyle = (focus: boolean = false, active: boolean = false) =>
  cx('group flex w-full items-center px-4 py-2 text-sm text-gray-700', {
    'font-semibold': active,
    'bg-gray-100 text-gray-900': focus,
  });

type Props = { currentTeamSlug?: string; teams: Array<{ slug: string; name: string }> };

export function TeamsDropdown({ teams = [], currentTeamSlug }: Props) {
  const currentTeam = teams.find((team) => team.slug === currentTeamSlug);

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
            <MenuItems
              anchor={{ to: 'bottom start', gap: '8px' }}
              className="z-10 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              {teams.map((team) => (
                <MenuItem key={team.slug} as={Fragment}>
                  {({ focus }) => (
                    <Link to={`/team/${team.slug}`} className={itemStyle(focus, team.slug === currentTeamSlug)}>
                      {team.name}
                    </Link>
                  )}
                </MenuItem>
              ))}
              <MenuSeparator className="border-t border-gray-200 my-1" />
              <MenuItem>
                {({ focus }) => (
                  <Link to="/team/new" className={itemStyle(focus)}>
                    <PlusIcon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    New team
                  </Link>
                )}
              </MenuItem>
            </MenuItems>
          </MenuTransition>
        </>
      )}
    </Menu>
  );
}
