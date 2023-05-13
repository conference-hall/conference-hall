import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { Footer } from '~/components/Footer';
import { Navbar } from '~/components/navbar/Navbar';
import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';

import { checkTeamAccess } from './server/check-team-access.server';

export const loader = async ({ request }: LoaderArgs) => {
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
