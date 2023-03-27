import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useOutletContext } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Navbar } from '~/shared-components/navbar/Navbar';
import type { UserContext } from '~/root';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function OrganizerRoute() {
  const { user, notifications } = useOutletContext<UserContext>();

  return (
    <>
      <Navbar user={user} notifications={notifications} withSearch />
      <Outlet />
    </>
  );
}
