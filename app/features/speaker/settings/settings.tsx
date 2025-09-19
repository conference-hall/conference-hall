import { AdjustmentsVerticalIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { href, Outlet } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/settings.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Settings | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

const menuItems = (t: TFunction) => {
  return [
    { to: href('/speaker/settings'), icon: ShieldCheckIcon, label: t('settings.nav.account'), end: true },
    { to: href('/speaker/settings/profile'), icon: UserCircleIcon, label: t('settings.nav.profile') },
    { to: href('/speaker/settings/preferences'), icon: AdjustmentsVerticalIcon, label: t('settings.nav.preferences') },
  ];
};

export default function SettingsRoute() {
  const { t } = useTranslation();

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <NavSideMenu
        aria-label={t('settings.menu')}
        items={menuItems(t)}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="lg:col-span-9">
        <Outlet />
      </div>
    </Page>
  );
}
