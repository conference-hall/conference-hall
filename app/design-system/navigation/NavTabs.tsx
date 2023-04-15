import c from 'classnames';
import { useMemo } from 'react';
import { NavLink } from '@remix-run/react';
import { Menu } from '@headlessui/react';
import { MenuTransition } from '../Transitions';
import { MenuItem } from '~/shared-components/navbar/UserMenuDesktop';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

type NavTabProps = { to: string; label: string; enabled?: boolean; end?: boolean };

type NavTabDropdownProps = {
  label: string;
  enabled: boolean;
  links: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
};

type Props = {
  tabs: Array<NavTabProps | NavTabDropdownProps>;
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
      {enabledTabs.map((tab) =>
        'to' in tab ? (
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
        ) : (
          <NavTabDropdown key={tab.label} variant={variant} tab={tab} />
        )
      )}
    </nav>
  );
}

function NavTabDropdown({ variant, tab }: { variant: keyof typeof BACKGROUND; tab: NavTabDropdownProps }) {
  return (
    <Menu as="div" className="relative z-30 ml-3">
      <div>
        <Menu.Button
          className={c('flex items-center rounded-md px-3 py-2 text-sm font-medium', DEFAULT_LINKS[variant])}
        >
          <span className="sr-only">Open {tab.label} menu</span>
          {tab.label}
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Menu.Button>
      </div>
      <MenuTransition>
        <Menu.Items className="absolute right-0 mt-4 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {tab.links.map(({ to, label, icon }) => (
            <MenuItem key={to} to={to} label={label} icon={icon} />
          ))}
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
}
