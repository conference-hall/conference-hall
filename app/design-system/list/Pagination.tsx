import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Link, useLocation, useSearchParams } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import { useMemo } from 'react';

import { ButtonLink } from '../Buttons';

const pageStyle = cva('relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20', {
  variants: {
    active: {
      true: 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
      false: 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0',
    },
  },
});

type Props = { current: number; total: number };

function getPageSearchParams(page: number, searchParams: URLSearchParams) {
  searchParams.delete('page');
  searchParams.append('page', String(page));
  return searchParams.toString();
}

export function Pagination({ current, total }: Props) {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pages = useMemo(() => Array.from({ length: total }, (_, i) => i + 1), [total]);

  const previous = current - 1 > 0 ? current - 1 : 1;
  const next = current + 1 <= total ? current + 1 : current;

  if (total <= 1) return null;

  return (
    <nav className="isolate inline-flex -space-x-px rounded-md bg-white shadow-sm" aria-label="Pagination">
      <Link
        key="previous"
        to={{ pathname: location.pathname, search: getPageSearchParams(previous, searchParams) }}
        preventScrollReset
        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
      </Link>
      {pages.map((page) => {
        if (showPageButton(page, current, total)) {
          return (
            <Link
              key={page}
              to={{ pathname: location.pathname, search: getPageSearchParams(page, searchParams) }}
              aria-current={page === current ? 'page' : undefined}
              className={pageStyle({ active: page === current })}
              preventScrollReset
            >
              {page}
            </Link>
          );
        } else if (showPageButton(page - 1, current, total)) {
          return (
            <div key="separator" className={pageStyle({ active: page === current })}>
              ...
            </div>
          );
        }
        return null;
      })}
      <Link
        key="next"
        to={{ pathname: location.pathname, search: getPageSearchParams(next, searchParams) }}
        preventScrollReset
        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
      </Link>
    </nav>
  );
}

export function PaginationMobile({ current, total }: Props) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const previous = current - 1 > 0 ? current - 1 : 1;
  const next = current + 1 <= total ? current + 1 : current;

  if (total <= 1) return null;

  return (
    <div className="flex flex-1 justify-between sm:hidden">
      <ButtonLink
        variant="secondary"
        to={{ pathname: location.pathname, search: getPageSearchParams(previous, searchParams) }}
        preventScrollReset
      >
        Previous
      </ButtonLink>
      <ButtonLink
        variant="secondary"
        to={{ pathname: location.pathname, search: getPageSearchParams(next, searchParams) }}
        preventScrollReset
      >
        Next
      </ButtonLink>
    </div>
  );
}

function showPageButton(page: number, current: number, total: number) {
  // Current page or when total pages are less than 6
  if (total <= 6 || page === current) {
    return true;
  }
  // The 3 first and 3 last pages
  if (page <= 3 || page >= total - 2) {
    return true;
  }
  // Page around the current one
  if (page === current - 1 || page === current + 1) {
    return true;
  }
  return false;
}
