import type { UserContext } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import type { getUser } from '~/shared-server/users/get-user.server';
import { json } from '@remix-run/node';
import { Outlet, useOutletContext } from '@remix-run/react';
import { SpeakerTabs } from '~/routes/speaker/components/SpeakerTabs';
import { Avatar } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { H2, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Navbar } from '~/shared-components/navbar/Navbar';

export type SpeakerContext = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export default function SpeakerRoute() {
  const { user, notifications } = useOutletContext<UserContext>();

  return (
    <>
      <Navbar user={user} notifications={notifications} withSearch />
      <header className="bg-gray-800">
        <Container className="hidden sm:flex sm:items-center sm:justify-between">
          <div className="py-4 sm:flex sm:items-center sm:space-x-5">
            <Avatar photoURL={user?.photoURL} name={user?.name} size="m" ring ringColor="white" />
            <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <H2 as="h1" variant="light" mb={0}>
                {user?.name}
              </H2>
              <Text variant="secondary">{user?.email}</Text>
            </div>
          </div>
          <div className="mt-5 flex justify-center space-x-4 sm:mt-0">
            <ButtonLink to="/speaker/talks/new">New talk</ButtonLink>
          </div>
        </Container>
      </header>
      <SpeakerTabs hasOrganization={Boolean(user?.organizationsCount)} />
      {user && <Outlet context={{ user }} />}
    </>
  );
}
