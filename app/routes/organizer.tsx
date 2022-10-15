import type { UserContext } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useOutletContext } from '@remix-run/react';
import { sessionRequired } from '~/services/auth/auth.server';
import { Navbar } from '~/components/Navbar';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function OrganizerRoute() {
  const { user } = useOutletContext<UserContext>();
  return (
    <>
      <Navbar user={user} />
      <Outlet context={{ user }} />
    </>
  );
}
