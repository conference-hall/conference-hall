import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { needsAdminRole } from '~/.server/admin/authorization.ts';

import { requireSession } from '~/libs/auth/session.ts';
import { Navbar } from '~/routes/__components/navbar/navbar.tsx';
import { useUser } from '~/routes/__components/use-user.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);

  await needsAdminRole(userId);

  return null;
};

export default function AdminLayoutRoute() {
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} />
      <Outlet context={{ user }} />
    </>
  );
}
