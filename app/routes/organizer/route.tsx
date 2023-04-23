import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { Footer } from '~/shared-components/Footer';
import { useUser } from '~/root';
import { checkOrganizerAccess } from './server/check-organizer-access.server';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  const canAccess = await checkOrganizerAccess(uid);

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
