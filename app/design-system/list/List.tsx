import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { Pagination, PaginationMobile } from '~/design-system/list/Pagination';

// <List /> component
export function List({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-md">{children}</div>;
}

// <List.Header /> component
function Header({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">{children}</div>;
}

List.Header = Header;

// <List.Content /> component
function Content({ children, ...rest }: { children: ReactNode }) {
  return (
    <ul className="divide-y divide-gray-200" {...rest}>
      {children}
    </ul>
  );
}

List.Content = Content;

// <List.Row /> component
function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <li className={cx('flex items-center', className)}>{children}</li>;
}

List.Row = Row;

// <RowLink /> component

type RowLinkProps = { children: ReactNode } & LinkProps;

export function RowLink({ children, className, ...rest }: RowLinkProps) {
  return (
    <li className="flex">
      <Link
        {...rest}
        className={cx(
          'w-full rounded-sm px-4 py-4 sm:px-6 hover:bg-gray-50 focus-visible:-outline-offset-1',
          className,
        )}
      >
        {children}
      </Link>
    </li>
  );
}

List.RowLink = RowLink;

// <List.Footer /> component
function Footer({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">{children}</div>;
}

List.Footer = Footer;

// <List.PaginationFooter /> component
function PaginationFooter({ current, pages, total }: { current: number; pages: number; total: number }) {
  return (
    <List.Footer>
      <PaginationMobile current={current} total={total} />
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{current}</span> to <span className="font-medium">{pages}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div>
          {/* TODO Change total prop to pages */}
          <Pagination current={current} total={pages} />
        </div>
      </div>
    </List.Footer>
  );
}

List.PaginationFooter = PaginationFooter;
