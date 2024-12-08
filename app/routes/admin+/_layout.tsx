import { Outlet } from 'react-router';
import { needsAdminRole } from '~/.server/admin/authorization.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { Navbar } from '~/routes/__components/navbar/navbar.tsx';
import type { Route } from './+types/_layout.ts';
import { AdminTabs } from './__components/admin-tabs.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
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
