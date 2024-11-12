import { Page } from '~/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';

export function AdminTabs() {
  return (
    <Page.NavHeader className="flex flex-col pb-2 sm:pb-0 sm:flex-row sm:items-center sm:space-between">
      <NavTabs py={4} scrollable className="grow">
        <NavTab to="/admin" end>
          Users
        </NavTab>
        <NavTab to="/admin/teams">Teams</NavTab>
        <NavTab to="/admin/flags">Feature flags</NavTab>
        <NavTab to="/admin/debug">Debug</NavTab>
      </NavTabs>
    </Page.NavHeader>
  );
}
