import { useMemo } from 'react';
import { NavLink, useLocation } from '@remix-run/react';
import { Menu } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import cn from 'classnames';
import { Container } from './Container';

export type Tab = { to: string; label: string; enabled: boolean; end?: boolean };
type NavTabsProps = { tabs: Array<Tab>; currentTab: Tab; className: string };
type Props = { tabs: Array<Tab> };

function useTabs(tabs: Array<Tab>) {
  const { pathname } = useLocation();
  const enabledTabs = useMemo(() => tabs.filter((tab) => tab.enabled), [tabs]);
  const currentTab = enabledTabs.filter((tab) => tab.to === pathname || pathname.startsWith(tab.to)).at(-1);
  return { enabledTabs, currentTab: currentTab || enabledTabs[0] };
}

function MobileNavTabs({ tabs, currentTab, className }: NavTabsProps) {
  return (
    <Container className={cn('z-10 inline-block w-full py-4 text-left', className)}>
      <div className="relative">
        <Menu>
          <Menu.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
            <span className="block truncate">{currentTab.label}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Menu.Button>
          <Menu.Items className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {tabs.map((tab) => (
              <Menu.Item key={tab.to}>
                {({ active }) => (
                  <NavLink to={tab.to} end={tab.end} className={tabMobileStyle(active)}>
                    {tab.label}
                  </NavLink>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>
    </Container>
  );
}

const tabMobileStyle = (isActive: boolean) => {
  return cn('group flex w-full items-center rounded-md p-2 text-sm', {
    'bg-indigo-500 text-white': isActive,
    'text-gray-900': !isActive,
  });
};

function DesktopNavTabs({ tabs, currentTab, className }: NavTabsProps) {
  return (
    <div className={cn('sticky top-0 z-10 border-b border-gray-200 bg-white pt-4', className)}>
      <Container>
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-current={currentTab.to === tab.to ? 'page' : undefined}
              end={tab.end}
              className={tabDesktopStyle}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </Container>
    </div>
  );
}

const tabDesktopStyle = ({ isActive }: { isActive: boolean }) => {
  return cn('whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm', {
    'border-indigo-500 text-indigo-600': isActive,
    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': !isActive,
  });
};

export function NavTabs({ tabs }: Props) {
  const { enabledTabs, currentTab } = useTabs(tabs);
  return (
    <>
      <MobileNavTabs tabs={enabledTabs} currentTab={currentTab} className="sm:hidden" />
      <DesktopNavTabs tabs={enabledTabs} currentTab={currentTab} className="hidden sm:block" />
    </>
  );
}
