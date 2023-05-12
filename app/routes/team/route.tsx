import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { Footer } from '~/shared-components/Footer';
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
