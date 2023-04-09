import type { UserContext } from '~/root';
import type { LoaderArgs } from '@remix-run/node';
import type { getUser } from '~/shared-server/users/get-user.server';
import { json } from '@remix-run/node';
import { Link, Outlet, useOutletContext } from '@remix-run/react';
import { SpeakerTabs } from '~/routes/speaker/components/SpeakerTabs';
import { Avatar } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { H1, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Navbar } from '~/shared-components/navbar/Navbar';
import { Footer } from '~/shared-components/Footer';

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
        <Container className="flex flex-col items-center justify-between py-4 sm:flex-row">
          <Link to="/speaker" className="flex items-center gap-4">
            <Avatar photoURL={user?.photoURL} name={user?.name} size="l" />
            <div className="flex-shrink-0">
              <H1 variant="light" size="2xl" mb={0}>
                {user?.name}
              </H1>
              <Text variant="secondary-light" size="s" heading>
                {user?.email}
              </Text>
            </div>
          </Link>
          <div className="flex justify-center">
            <ButtonLink to="/speaker/talks/new">New talk</ButtonLink>
          </div>
        </Container>
      </header>

      <SpeakerTabs hasOrganization={Boolean(user?.organizationsCount)} />

      {user && <Outlet context={{ user }} />}
      <Footer />
    </>
  );
}
