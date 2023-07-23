import { PlusIcon } from '@heroicons/react/20/solid';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { ButtonLink } from '~/design-system/Buttons';
import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { useUser } from '~/root';
import { parsePage } from '~/schemas/pagination';

import { SpeakerActivitiesSection } from './components/SpeakerActivitiesSection';
import { SpeakerDetailsSection } from './components/SpeakerDetailsSection';
import { getActivities } from './server/get-activities.server';

export const meta = mergeMeta(() => [{ title: 'Home speaker | Conference Hall' }]);

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireSession(request);
  const url = new URL(request.url);
  const page = parsePage(url.searchParams);
  const activities = await getActivities(userId, page);
  return json(activities);
};

export default function ProfileRoute() {
  const { activities, nextPage, hasNextPage } = useLoaderData<typeof loader>();
  const { user } = useUser();

  if (!user) return null;

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
          picture={user.picture}
          bio={user.bio}
          address={user.address}
          company={user.company}
          socials={user.socials}
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