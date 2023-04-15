import c from 'classnames';
import { useMemo } from 'react';
import { NavLink } from '@remix-run/react';

type Props = {
  tabs: Array<{ to: string; label: string; enabled: boolean; end?: boolean }>;
  variant?: keyof typeof BACKGROUND;
  py?: keyof typeof PADDING_Y;
};

const BACKGROUND = {
  light: 'bg-white',
  dark: 'bg-gray-800',
};

const DEFAULT_LINKS = {
  light: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
  dark: 'text-gray-300 hover:bg-gray-700 hover:text-white',
};

const ACTIVE_LINKS = {
  light: 'bg-gray-100 text-gray-900 font-medium',
  dark: 'bg-gray-900 text-white font-medium',
};

const PADDING_Y = {
  0: 'py-0',
  4: 'py-4',
};

export function NavTabs({ tabs, py = 0, variant = 'light' }: Props) {
  const enabledTabs = useMemo(() => tabs.filter((tab) => tab.enabled), [tabs]);

  return (
    <nav className={c('flex space-x-4', PADDING_Y[py], BACKGROUND[variant])} aria-label="Tabs">
      {enabledTabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={(tab) =>
            c('rounded-md px-3 py-2 text-sm font-medium', {
              [DEFAULT_LINKS[variant]]: !tab.isActive,
              [ACTIVE_LINKS[variant]]: tab.isActive,
            })
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
