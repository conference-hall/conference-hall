import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { NavLink, type NavLinkProps } from 'react-router';

type Props = {
  children: ReactNode;
  variant?: keyof typeof BACKGROUND;
  py?: keyof typeof PADDING_Y;
  scrollable?: boolean;
  className?: string;
};

const BACKGROUND = {
  light: 'bg-white',
  dark: 'bg-transparent',
};

const DEFAULT_LINKS = {
  light: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-indigo-600',
  dark: 'text-gray-300 hover:bg-gray-900 font-semibold hover:text-white focus-visible:outline-white',
};

const ACTIVE_LINKS = {
  light: 'bg-gray-100 text-gray-900 font-semibold focus-visible:outline-indigo-600',
  dark: 'bg-gray-900 text-white font-semibold focus-visible:outline-gray-200',
};

const ICON = {
  light: 'h-4 w-4 shrink-0 text-gray-600',
  dark: 'h-4 w-4 shrink-0 text-gray-300',
};

const PADDING_Y = {
  0: 'py-0',
  4: 'py-2 sm:py-4',
};

export function NavTabs({ children, py = 0, variant = 'light', scrollable = false, className }: Props) {
  return (
    <nav
      className={cx(
        'flex space-x-4 px-1',
        PADDING_Y[py],
        BACKGROUND[variant],
        { 'overflow-x-auto': scrollable },
        className,
      )}
      aria-label="Tabs"
    >
      {children}
    </nav>
  );
}

type NavTabProps = {
  children: ReactNode;
  count?: number;
  variant?: keyof typeof BACKGROUND;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
} & NavLinkProps;

export function NavTab({ to, end, count, variant = 'light', icon: Icon, className, children }: NavTabProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={(tab) =>
        cx(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap focus-visible:outline focus-visible:outline-2',
          {
            [DEFAULT_LINKS[variant]]: !tab.isActive,
            [ACTIVE_LINKS[variant]]: tab.isActive,
          },
          className,
        )
      }
    >
      {Icon ? <Icon className={ICON[variant]} /> : null}
      {children}
      {count ? (
        <span className="ml-3 hidden rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-900 md:inline-block">
          {count}
        </span>
      ) : null}
    </NavLink>
  );
}
