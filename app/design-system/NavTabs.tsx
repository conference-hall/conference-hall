import { useMemo } from 'react';
import { NavLink, useLocation } from '@remix-run/react';
import cn from 'classnames';

type Tab = { to: string; label: string; enabled: boolean; end?: boolean };

type Props = { tabs: Array<Tab>; light?: boolean };

function useTabs(tabs: Array<Tab>) {
  const { pathname } = useLocation();
  const enabledTabs = useMemo(() => tabs.filter((tab) => tab.enabled), [tabs]);
  const currentTab = enabledTabs.filter((tab) => tab.to === pathname || pathname.startsWith(tab.to)).at(-1);
  return { enabledTabs, currentTab: currentTab || enabledTabs[0] };
}

export function NavTabs({ tabs, light = false }: Props) {
  const { enabledTabs, currentTab } = useTabs(tabs);

  return (
    <nav className={cn('flex space-x-4 pb-4', { 'bg-gray-800': !light, 'bg-white': light })} aria-label="Tabs">
      {enabledTabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          aria-current={currentTab.to === tab.to ? 'page' : undefined}
          end={tab.end}
          className={(tab) => tabDesktopStyle({ ...tab, light })}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

const tabDesktopStyle = ({ isActive, light }: { isActive: boolean; light?: boolean }) => {
  return cn('rounded-md px-3 py-2 text-sm', {
    'bg-gray-900 text-white font-medium': !light && isActive,
    'text-gray-300 hover:bg-gray-700 hover:text-white font-medium': !light && !isActive,
    'bg-gray-100 font-medium text-gray-900': light && isActive,
    'text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900': light && !isActive,
  });
};
