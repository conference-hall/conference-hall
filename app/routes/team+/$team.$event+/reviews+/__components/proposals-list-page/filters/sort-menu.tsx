import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowsUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Link, useLocation, useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react';

import { button } from '~/design-system/buttons.tsx';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { useEvent } from '~/routes/team+/$team.$event+/__components/use-event.tsx';

import { sortByDatesOptions, sortByReviewsOptions } from './filters.ts';

export function SortMenu() {
  const location = useLocation();
  const [params] = useSearchParams();
  const { event } = useEvent();
  const { sort = 'newest', ...filters } = Object.fromEntries(params.entries());

  const options = event.displayProposalsReviews ? [...sortByDatesOptions, ...sortByReviewsOptions] : sortByDatesOptions;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className={button({ variant: 'secondary' })}>
        <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
        <span>Sort</span>
      </MenuButton>
      <MenuTransition>
        <MenuItems
          anchor={{ to: 'bottom end', gap: '8px' }}
          className="z-10 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            {options.map(({ name, value }) => {
              const selected = value === sort;
              const search = new URLSearchParams({ ...filters, sort: value });

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
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </Link>
                  )}
                </MenuItem>
              );
            })}
          </div>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
