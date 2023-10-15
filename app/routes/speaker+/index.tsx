import { PlusIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { useUser } from '~/root.tsx';
import { parsePage } from '~/routes/__types/pagination.ts';

import { SpeakerActivitiesSection } from './__components/SpeakerActivitiesSection.tsx';
import { SpeakerDetailsSection } from './__components/SpeakerDetailsSection.tsx';
import { getActivities } from './__server/get-activities.server.ts';

export const meta = mergeMeta(() => [{ title: 'Home speaker | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

      <PageContent className="grid grid-cols-1 items-start lg:grid-cols-3">
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
          className="lg:col-span-2"
        />
      </PageContent>
    </>
  );
}
