import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';

import { button } from '~/design-system/buttons.tsx';
import { MenuTransition } from '~/design-system/transitions.tsx';

type SortMenuProps = {
  options: Array<{ name: string; value: string }>;
  defaultSort?: string;
  defaultOrder?: string;
};

export function SortMenu({ options, defaultSort, defaultOrder }: SortMenuProps) {
  const location = useLocation();
  const [params] = useSearchParams();
  const { sort = defaultSort, order = defaultOrder, ...others } = Object.fromEntries(params.entries());

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className={button({ variant: 'secondary' })}>
        <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
        <span>Sort by</span>
      </MenuButton>

      <MenuTransition>
        <MenuItems
          anchor={{ to: 'bottom end', gap: '8px' }}
          className="z-10 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
        >
          {options.map(({ name, value }) => {
            const selected = value === sort;
            const orderValue = selected && order === 'asc' ? 'desc' : 'asc';
            const search = new URLSearchParams({ ...others, sort: value, order: orderValue });

            return (
              <MenuItem as={Fragment} key={value}>
                {({ focus }) => (
                  <Link
                    to={{ pathname: location.pathname, search: search.toString() }}
                    className={cx(
                      'relative block px-4 py-2 text-sm',
                      focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      selected ? 'font-semibold' : '',
                    )}
                  >
                    {name}
                    {selected ? (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        {order === 'asc' ? (
                          <ArrowDownIcon className="size-5" aria-label="Ascending sort" />
                        ) : (
                          <ArrowUpIcon className="size-5" aria-label="Descending sort" />
                        )}
                      </span>
                    ) : null}
                  </Link>
                )}
              </MenuItem>
            );
          })}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
