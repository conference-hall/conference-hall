import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Container } from '~/design-system/layouts/container.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { Navbar } from '~/routes/__components/navbar/navbar.tsx';
import { useUser } from '~/routes/__components/use-user.tsx';

import { SpeakerTabs } from './__components/speaker-tabs.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const profile = await SpeakerProfile.for(userId).get();
  return json(profile);
};

export default function SpeakerRoute() {
  const { user } = useUser();
  const profile = useLoaderData<typeof loader>();

  return (
    <>
      <Navbar user={user} withSearch />

      <header className="hidden sm:block bg-gray-800">
        <Container className="h-24 flex gap-6 items-end relative">
          <Avatar
            picture={profile.picture}
            name={profile.name}
            size="4xl"
            ring
            ringColor="white"
            className="absolute -bottom-12"
          />
          <div className="ml-40 p-2">
            <H1 variant="light">{profile.name}</H1>
            {profile.company && <Text variant="secondary-light">{profile.company}</Text>}
          </div>
        </Container>
      </header>

      <SpeakerTabs className="sm:ml-40" />

      <Outlet context={{ user }} />
    </>
  );
}
