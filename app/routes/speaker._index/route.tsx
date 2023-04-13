import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { getActivities } from './server/get-activities.server';
import { mapErrorToResponse } from '~/libs/errors';
import { Container } from '~/design-system/Container';
import type { SpeakerContext } from '../speaker/route';
import { SpeakerDetailsSection } from './components/SpeakerDetailsSection';
import { parsePage } from '~/schemas/pagination';
import { SpeakerActivitiesSection } from './components/SpeakerActivitiesSection';
import { ButtonLink } from '~/design-system/Buttons';
import { PlusIcon } from '@heroicons/react/20/solid';
import { PageHeaderTitle } from '~/design-system/PageHeaderTitle';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const url = new URL(request.url);
    const page = await parsePage(url.searchParams);
    const activities = await getActivities(uid, page);
    return json(activities);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function ProfileRoute() {
  const { activities, nextPage, hasNextPage } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<SpeakerContext>();

  return (
    <>
      <PageHeaderTitle title="Welcome to Conference Hall" subtitle="Your last submissions to conferences and meetups.">
        <ButtonLink iconLeft={PlusIcon} to="/speaker/talks/new">
          New talk
        </ButtonLink>
      </PageHeaderTitle>

      <Container className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
        <SpeakerDetailsSection
          name={user.name}
          email={user.email}
          photoURL={user.photoURL}
          bio={user.bio}
          address={user.address}
          company={user.company}
          github={user.github}
          twitter={user.twitter}
        />

        <SpeakerActivitiesSection
          activities={activities}
          nextPage={nextPage}
          hasNextPage={hasNextPage}
          className="space-y-8 lg:col-span-2"
        />
      </Container>
    </>
  );
}
