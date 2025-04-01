import { AdjustmentsVerticalIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Outlet, href } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/layout.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Settings | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

const MENU_ITEMS = [
  { to: href('/speaker/settings'), icon: ShieldCheckIcon, label: 'Account' },
  { to: href('/speaker/settings/profile'), icon: UserCircleIcon, label: 'Speaker profile' },
  { to: href('/speaker/settings/preferences'), icon: AdjustmentsVerticalIcon, label: 'Preferences' },
];

export default function UserSettingsRoute() {
  return (
    <Page className="lg:grid lg:grid-cols-12">
      <NavSideMenu
        aria-label="User settings menu"
        items={MENU_ITEMS}
        className="hidden sm:block w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
