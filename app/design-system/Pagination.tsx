import { Link, useLocation, useSearchParams } from '@remix-run/react';
import c from 'classnames';
import { useMemo } from 'react';

type Props = {
  current: number;
  total: number;
  className?: string;
};

function getPageSearchParams(page: number, searchParams: URLSearchParams) {
  searchParams.delete('page');
  searchParams.append('page', String(page));
  return searchParams.toString();
}

export function Pagination({ current, total, className }: Props) {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pages = useMemo(() => Array.from({ length: total }, (_, i) => i + 1), [total]);

  if (total <= 1) return null;

  return (
    <nav className={c('flex items-center justify-center border-t border-gray-200 px-4 sm:px-0', className)}>
      {pages.map((page) => {
        const styles = c('border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium', {
          'border-indigo-500 text-indigo-600': page === current,
          'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': page !== current,
        });

        if (showPageButton(page, current, total)) {
          return (
            <Link
              key={page}
              to={{ pathname: location.pathname, search: getPageSearchParams(page, searchParams) }}
              aria-current={page === current ? 'page' : undefined}
              className={styles}
              preventScrollReset
            >
              {page}
            </Link>
          );
        } else if (showPageButton(page - 1, current, total)) {
          return (
            <div key="separator" className="inline-flex items-center px-4 pt-4 text-sm font-medium text-gray-500">
              ...
            </div>
          );
        }
        return null;
      })}
    </nav>
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
