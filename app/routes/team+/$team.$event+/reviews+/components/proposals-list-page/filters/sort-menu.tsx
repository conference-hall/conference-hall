import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowsUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';

import { button } from '~/design-system/buttons.tsx';
import { MenuTransition } from '~/design-system/transitions.tsx';

import { menuItem, menuItems } from '~/design-system/styles/menu.styles.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { sortByCommentsOptions, sortByDatesOptions, sortByReviewsOptions } from './filters.ts';

export function SortMenu() {
  const location = useLocation();
  const [params] = useSearchParams();
  const { sort = 'newest', ...filters } = Object.fromEntries(params.entries());

  const { displayProposalsReviews } = useCurrentEvent();
  const options = [
    ...sortByDatesOptions,
    ...(displayProposalsReviews ? sortByReviewsOptions : []),
    ...sortByCommentsOptions,
  ];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className={button({ variant: 'secondary' })}>
        <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
        <span>Sort</span>
      </MenuButton>
      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          {options.map(({ name, value }) => {
            const selected = value === sort;
            const search = new URLSearchParams({ ...filters, sort: value });

            return (
              <MenuItem as={Fragment} key={value}>
                <Link
                  to={{ pathname: location.pathname, search: search.toString() }}
                  className={cx('relative', menuItem(), { 'font-semibold': selected })}
                >
                  {name}
                  {selected ? (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </Link>
              </MenuItem>
            );
          })}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
