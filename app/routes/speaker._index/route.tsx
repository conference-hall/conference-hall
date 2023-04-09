import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { sessionRequired } from '~/libs/auth/auth.server';
import { getActivity } from './server/get-activity.server';
import { mapErrorToResponse } from '~/libs/errors';
import { Container } from '~/design-system/Container';
import { H2 } from '~/design-system/Typography';
import type { SpeakerContext } from '../speaker/route';
import { SpeakerDetailsSection } from './components/SpeakerDetailsSection';
import { parsePage } from '~/schemas/pagination';
import { SpeakerActivitiesSection } from './components/SpeakerActivitiesSection';
import { ButtonLink } from '~/design-system/Buttons';
import { PlusIcon } from '@heroicons/react/20/solid';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const url = new URL(request.url);
    const page = await parsePage(url.searchParams);
    const activities = await getActivity(uid, page);
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
      <Container className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <H2 mb={0}>Activity</H2>
          <ButtonLink iconLeft={PlusIcon} to="/speaker/talks/new">
            New talk
          </ButtonLink>
        </div>
        <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          <SpeakerActivitiesSection
            activities={activities}
            nextPage={nextPage}
            hasNextPage={hasNextPage}
            className="space-y-8 lg:col-span-2"
          />

          <SpeakerDetailsSection
            name={user.name}
            bio={user.bio}
            address={user.address}
            company={user.company}
            github={user.github}
            twitter={user.twitter}
          />
        </div>
      </Container>
    </>
  );
}
