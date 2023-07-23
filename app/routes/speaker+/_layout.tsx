import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { Footer } from '~/components/Footer';
import { Navbar } from '~/components/navbar/Navbar';
import { requireSession } from '~/libs/auth/session';
import { useUser } from '~/root';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return json(null);
};

export default function SpeakerRoute() {
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} withSearch />

      <Outlet context={{ user }} />

      <Footer />
    </>
  );
}
