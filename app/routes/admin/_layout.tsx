import { Outlet } from 'react-router';
import { needsAdminRole } from '~/.server/admin/authorization.ts';
import { Navbar } from '~/routes/components/navbar/navbar.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/_layout.ts';
import { AdminTabs } from './components/admin-tabs.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  await needsAdminRole(userId);
  return null;
};

export default function AdminLayoutRoute() {
  return (
    <>
      <Navbar />
      <AdminTabs />
      <Outlet />
    </>
  );
}
