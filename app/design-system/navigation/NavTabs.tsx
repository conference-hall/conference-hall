import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { NavLink } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useMemo } from 'react';

import { Menu } from '../menus/Menu.tsx';

type NavTabProps = { to: string; label: string; count?: number; enabled?: boolean; end?: boolean };

type NavTabDropdownProps = {
  label: string;
  enabled?: boolean;
  links: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
};

type Props = {
  tabs: Array<NavTabProps | NavTabDropdownProps>;
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

export function NavTabs({ tabs, py = 0, variant = 'light', scrollable = false }: Props) {
  const enabledTabs = useMemo(() => tabs.filter((tab) => tab.enabled), [tabs]);

  return (
    <nav
      className={cx('flex space-x-4 px-1', PADDING_Y[py], BACKGROUND[variant], { 'overflow-x-auto': scrollable })}
      aria-label="Tabs"
    >
      {enabledTabs.map((tab) =>
        'to' in tab ? (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={(tab) =>
              cx(
                'rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap focus-visible:outline focus-visible:outline-2',
                {
                  [DEFAULT_LINKS[variant]]: !tab.isActive,
                  [ACTIVE_LINKS[variant]]: tab.isActive,
                },
              )
            }
          >
            {tab.label}
            {tab.count ? (
              <span className="ml-3 hidden rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-900 md:inline-block">
                {tab.count}
              </span>
            ) : null}
          </NavLink>
        ) : (
          <NavTabDropdown key={tab.label} variant={variant} tab={tab} />
        ),
      )}
    </nav>
  );
}

function NavTabDropdown({ variant, tab }: { variant: keyof typeof BACKGROUND; tab: NavTabDropdownProps }) {
  const Trigger = () => (
    <>
      {tab.label}
      <ChevronDownIcon className="ml-2 h-4 w-4" />
    </>
  );

  return (
    <Menu
      trigger={Trigger}
      triggerLabel={`Open ${tab.label} menu`}
      triggerClassname={cx(
        'flex items-center rounded-md px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2',
        DEFAULT_LINKS[variant],
      )}
    >
      {tab.links.map(({ to, label, icon }) => (
        <Menu.ItemLink key={to} to={to} icon={icon}>
          {label}
        </Menu.ItemLink>
      ))}
    </Menu>
  );
}
