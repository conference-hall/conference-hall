import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Navbar } from '~/components/navbar/Navbar';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function OrganizerRoute() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
