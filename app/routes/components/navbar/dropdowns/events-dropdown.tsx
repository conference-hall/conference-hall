import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { Link } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { menuItem, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';

const menuStyle = cx(
  'flex items-center gap-1',
  'text-sm font-semibold whitespace-nowrap cursor-pointer',
  'text-gray-300 hover:bg-gray-900 hover:text-white focus-visible:outline-white',
  'px-3 py-2 rounded-md focus-visible:outline-2',
);

type Props = {
  currentTeam: { slug: string; name: string };
  currentEvent: { slug: string; name: string; logoUrl: string | null };
  events: Array<{ slug: string; name: string; logoUrl: string | null; archived: boolean }>;
};

export function EventsDropdown({ events = [], currentTeam, currentEvent }: Props) {
  const eventsDisplayed = events.filter((event) => !event.archived || event.slug === currentEvent.slug);

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
              to={`/team/${currentTeam.slug}/${slug}`}
              className={cx(menuItem(), { 'font-semibold': slug === currentEvent.slug })}
            >
              <Avatar size="xs" picture={logoUrl} name={name} square aria-hidden />
              {name}
            </MenuItem>
          ))}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
