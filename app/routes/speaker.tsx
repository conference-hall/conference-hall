import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData } from '@remix-run/react';
import { SpeakerTabs } from '~/components/SpeakerTabs';
import { Avatar } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { H1, Text } from '~/design-system/Typography';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { getProfile } from '~/services/speakers/profile.server';

export type ProfileContext = { profile: Awaited<ReturnType<typeof getProfile>> };

export const loader = async ({ request }: LoaderArgs) => {
  const uid = await sessionRequired(request);
  try {
    const profile = await getProfile(uid);
    return json(profile);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function SpeakerRoute() {
  const profile = useLoaderData<typeof loader>();
  return (
    <>
      <Container className="my-4 hidden sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex sm:items-center sm:space-x-5">
          <Avatar photoURL={profile.photoURL} size="m" ring />
          <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
            <H1>{profile.name}</H1>
            <Text variant="secondary">{profile.email}</Text>
          </div>
        </div>
        <div className="mt-5 flex justify-center space-x-4 sm:mt-0">
          <ButtonLink to="/speaker/talks/new">New talk</ButtonLink>
        </div>
      </Container>
      <SpeakerTabs hasOrganization={profile.organizationsCount > 0} />
      <Outlet context={{ profile }} />
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
