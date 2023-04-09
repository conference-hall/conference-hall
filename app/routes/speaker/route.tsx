import type { UserContext } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import type { getUser } from '~/shared-server/users/get-user.server';
import { json } from '@remix-run/node';
import { Outlet, useOutletContext } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { Footer } from '~/shared-components/Footer';
import { NavLink } from '~/shared-components/navbar/NavLink';

export type SpeakerContext = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function SpeakerRoute() {
  const { user, notifications } = useOutletContext<UserContext>();
  const hasOrganization = Boolean(user?.organizationsCount);

  return (
    <>
      <Navbar user={user} notifications={notifications} withSearch>
        <NavLink to="/speaker" end>
          Activity
        </NavLink>
        <NavLink to="/speaker/talks">Talks</NavLink>
        <NavLink to="/speaker/profile">Profile</NavLink>
        {hasOrganization && <NavLink to="/organizer">Organizations</NavLink>}
      </Navbar>

      {user && <Outlet context={{ user }} />}
      <Footer />
    </>
  );
}
