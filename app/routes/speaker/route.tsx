import { useUser } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { requireSession } from '~/libs/auth/session';
import { Navbar } from '~/components/navbar/Navbar';
import { Footer } from '~/components/Footer';

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
