import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { requireSession } from '~/libs/auth/session.ts';
import { Footer } from '~/routes/__components/Footer.tsx';
import { Navbar } from '~/routes/__components/navbar/Navbar.tsx';
import { useUser } from '~/routes/__components/useUser';

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
