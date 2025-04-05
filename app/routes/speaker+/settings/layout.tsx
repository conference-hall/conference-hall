import { AdjustmentsVerticalIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Outlet, href } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useFlags } from '~/routes/components/contexts/flags-context.tsx';
import type { Route } from './+types/layout.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Settings | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

const menuItems = (userPreferences: boolean) => {
  const items = [
    { to: href('/speaker/settings'), icon: ShieldCheckIcon, label: 'Account' },
    { to: href('/speaker/settings/profile'), icon: UserCircleIcon, label: 'Speaker profile' },
  ];
  if (userPreferences) {
    items.push({ to: href('/speaker/settings/preferences'), icon: AdjustmentsVerticalIcon, label: 'Preferences' });
  }
  return items;
};

export default function UserSettingsRoute() {
  const flags = useFlags();

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <NavSideMenu
        aria-label="User settings menu"
        items={menuItems(flags.userPreferences)}
        className="hidden sm:block w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
