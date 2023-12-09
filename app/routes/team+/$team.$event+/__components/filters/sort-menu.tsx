import { Menu } from '@headlessui/react';
import { ArrowsUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Link, useLocation, useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react';

import { button } from '~/design-system/Buttons';
import { MenuTransition } from '~/design-system/Transitions';

import { useTeamEvent } from '../../_layout';
import { sortByDatesOptions, sortByReviewsOptions } from './filters';

export function SortMenu() {
  const location = useLocation();
  const [params] = useSearchParams();
  const { event } = useTeamEvent();
  const { sort = 'newest', ...filters } = Object.fromEntries(params.entries());

  const options = event.displayProposalsReviews ? [...sortByDatesOptions, ...sortByReviewsOptions] : sortByDatesOptions;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={button({ variant: 'secondary' })}>
        <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
        <span className="hidden sm:inline">Sort</span>
      </Menu.Button>
      <MenuTransition>
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map(({ name, value }) => {
              const selected = value === sort;
              const search = new URLSearchParams({ ...filters, sort: value });

              return (
                <Menu.Item as={Fragment} key={value}>
                  {({ active }) => (
                    <Link
                      to={{ pathname: location.pathname, search: search.toString() }}
                      className={cx(
                        'relative block px-4 py-2 text-sm',
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
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
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
}
