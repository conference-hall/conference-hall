import { Outlet } from 'react-router';
import { needsAdminRole } from '~/.server/admin/authorization.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { Navbar } from '~/routes/components/navbar/navbar.tsx';
import type { Route } from './+types/_layout.ts';
import { AdminTabs } from './components/admin-tabs.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  await needsAdminRole(userId);
  return null;
};

// todo(i18n): all admin pages should be translated
export default function AdminLayoutRoute() {
  return (
    <>
      <Navbar />
      <AdminTabs />
      <Outlet />
    </>
  );
}
