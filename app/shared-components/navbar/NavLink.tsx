import c from 'classnames';
import type { RemixNavLinkProps } from '@remix-run/react/dist/components';
import { NavLink as RemixNavLink } from '@remix-run/react';

export function NavLink(props: RemixNavLinkProps) {
  return (
    <RemixNavLink to={props.to} end={props.end} className={tabDesktopStyle}>
      {props.children}
    </RemixNavLink>
  );
}

const tabDesktopStyle = ({ isActive }: { isActive: boolean }) => {
  return c('rounded-md px-3 py-2 text-sm font-medium', {
    'bg-gray-900 text-white': isActive,
    'text-gray-300 hover:bg-gray-700 hover:text-white': !isActive,
  });
};
