import type { UserContext } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useOutletContext } from '@remix-run/react';
import { SpeakerTabs } from '~/components/SpeakerTabs';
import { Avatar } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { H1, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/services/auth/auth.server';
import { Navbar } from '~/components/Navbar';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function SpeakerRoute() {
  const { user } = useOutletContext<UserContext>();
  return (
    <>
      <Navbar user={user} />
      <Container className="my-4 hidden sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex sm:items-center sm:space-x-5">
          <Avatar photoURL={user.photoURL} size="m" ring />
          <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
            <H1>{user.name}</H1>
            <Text variant="secondary">{user.email}</Text>
          </div>
        </div>
        <div className="mt-5 flex justify-center space-x-4 sm:mt-0">
          <ButtonLink to="/speaker/talks/new">New talk</ButtonLink>
        </div>
      </Container>
      <SpeakerTabs hasOrganization={user.organizationsCount > 0} />
      <Outlet context={{ user }} />
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
