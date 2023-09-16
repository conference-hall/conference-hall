import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';
import { Footer } from '~/routes/__components/Footer';
import { Navbar } from '~/routes/__components/navbar/Navbar';

import { checkTeamAccess } from './__server/check-team-access.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const canAccess = await checkTeamAccess(userId);

  if (!canAccess) return redirect('/request-access');

  return json(null);
};

export default function OrganizerRoute() {
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} withSearch />

      <Outlet context={{ user }} />

      <Footer />
    </>
  );
}
