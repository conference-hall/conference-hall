import { CreditCardIcon, KeyIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Outlet } from 'react-router';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/profile.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'User settings | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  const withEmailPasswordSignin = await flags.get('emailPasswordSignin');
  return { withEmailPasswordSignin };
};

const MENU_ITEMS = [
  { to: '/speaker/profile#personal-info', icon: UserCircleIcon, label: 'Personal information' },
  { to: '/speaker/profile#speaker-details', icon: KeyIcon, label: 'Speaker details' },
  { to: '/speaker/profile#additional-info', icon: CreditCardIcon, label: 'Additional information' },
  { to: '/speaker/profile/security', icon: ShieldCheckIcon, label: 'Security' },
];

export default function UserSettingsRoute({ loaderData }: Route.ComponentProps) {
  const menuItems = MENU_ITEMS.filter((item) => {
    if (item.to === '/speaker/profile/security') return loaderData.withEmailPasswordSignin;
    return true;
  });

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <NavSideMenu
        aria-label="User settings menu"
        items={menuItems}
        className="hidden sm:block w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
        noActive
      />

      <div className="lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
