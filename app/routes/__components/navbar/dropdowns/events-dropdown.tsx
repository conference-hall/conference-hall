import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react/jsx-runtime';
import { Avatar } from '~/design-system/avatar.tsx';

import { MenuTransition } from '~/design-system/transitions.tsx';

const menuStyle = cx(
  'flex items-center gap-1',
  'text-sm font-semibold whitespace-nowrap',
  'text-gray-300 hover:bg-gray-900 hover:text-white focus-visible:outline-white',
  'px-3 py-2 rounded-md focus-visible:outline focus-visible:outline-2',
);

const itemStyle = (focus = false, active = false) =>
  cx('group flex w-full items-center px-4 py-2 text-sm text-gray-700', {
    'font-semibold': active,
    'bg-gray-100 text-gray-900': focus,
  });

type Props = {
  currentTeam: { slug: string; name: string };
  currentEvent: { slug: string; name: string; logoUrl: string | null };
  events: Array<{ slug: string; name: string; logoUrl: string | null; archived: boolean }>;
};

export function EventsDropdown({ events = [], currentTeam, currentEvent }: Props) {
  const eventsDisplayed = events.filter((event) => !event.archived || event.slug === currentEvent.slug);

  return (
    <Menu as="div" className="hidden sm:flex relative z-20 shrink-0">
      {({ open }) => (
        <>
          <MenuButton className={menuStyle}>
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
              {eventsDisplayed.map(({ slug, name, logoUrl }) => (
                <MenuItem key={slug} as={Fragment}>
                  {({ focus }) => (
                    <Link
                      to={`/team/${currentTeam.slug}/${slug}`}
                      className={itemStyle(focus, slug === currentEvent.slug)}
                    >
                      <Avatar size="xs" picture={logoUrl} name={name} square aria-hidden className="mr-2" />
                      {name}
                    </Link>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </MenuTransition>
        </>
      )}
    </Menu>
  );
}
