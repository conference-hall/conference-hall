import { NavLink } from '@remix-run/react';
import type { RemixNavLinkProps } from '@remix-run/react/dist/components';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  variant?: keyof typeof BACKGROUND;
  py?: keyof typeof PADDING_Y;
  scrollable?: boolean;
};

const BACKGROUND = {
  light: 'bg-white',
  dark: 'bg-gray-800',
};

const DEFAULT_LINKS = {
  light: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
  dark: 'text-gray-300 hover:bg-gray-700 hover:text-white focus-visible:outline-white',
};

const ACTIVE_LINKS = {
  light: 'bg-gray-100 text-gray-900 font-semibold',
  dark: 'bg-gray-900 text-white font-semibold focus-visible:outline-gray-200',
};

const PADDING_Y = {
  0: 'py-0',
  4: 'py-4',
};

export function NavTabs({ children, py = 0, variant = 'light', scrollable = false }: Props) {
  return (
    <nav
      className={cx('flex space-x-4 px-1', PADDING_Y[py], BACKGROUND[variant], { 'overflow-x-auto': scrollable })}
      aria-label="Tabs"
    >
      {children}
    </nav>
  );
}

type NavTabProps = {
  children: ReactNode;
  count?: number;
  end?: boolean;
  variant?: keyof typeof BACKGROUND;
} & RemixNavLinkProps;

export function NavTab({ to, end, count, variant = 'light', children }: NavTabProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={(tab) =>
        cx('rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap focus-visible:outline focus-visible:outline-2', {
          [DEFAULT_LINKS[variant]]: !tab.isActive,
          [ACTIVE_LINKS[variant]]: tab.isActive,
        })
      }
    >
      {children}
      {count ? (
        <span className="ml-3 hidden rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-900 md:inline-block">
          {count}
        </span>
      ) : null}
    </NavLink>
  );
}
