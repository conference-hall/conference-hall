import { useUser } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { Footer } from '~/shared-components/Footer';
import { SpeakerNavLinks } from '~/shared-components/navbar/SpeakerNavLinks';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function SpeakerRoute() {
  const { user } = useUser();

  return (
    <>
      <Navbar user={user} withSearch>
        <SpeakerNavLinks organizations={user?.organizations} />
      </Navbar>

      <Outlet context={{ user }} />

      <Footer />
    </>
  );
}
