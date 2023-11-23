import { PlusIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { SpeakerActivities } from '~/domains/speaker/SpeakerActivities.ts';
import { SpeakerProfile } from '~/domains/speaker/SpeakerProfile.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { parsePage } from '~/routes/__types/pagination.ts';

import { SpeakerActivitiesSection } from './__components/SpeakerActivitiesSection.tsx';
import { SpeakerDetailsSection } from './__components/SpeakerDetailsSection.tsx';

export const meta = mergeMeta(() => [{ title: 'Home speaker | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const profile = await SpeakerProfile.for(userId).get();

  const url = new URL(request.url);
  const page = parsePage(url.searchParams);
  const { activities, nextPage, hasNextPage } = await SpeakerActivities.for(userId).list(page);

  return json({ profile, activities, nextPage, hasNextPage });
};

export default function ProfileRoute() {
  const { profile, activities, nextPage, hasNextPage } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeaderTitle title="Welcome to Conference Hall" subtitle="Your last submissions to conferences and meetups.">
        <ButtonLink iconLeft={PlusIcon} to="/speaker/talks/new">
          New talk
        </ButtonLink>
      </PageHeaderTitle>

      <PageContent className="grid grid-cols-1 items-start lg:grid-cols-3">
        <SpeakerDetailsSection
          name={profile.name}
          email={profile.email}
          picture={profile.picture}
          bio={profile.bio}
          address={profile.address}
          company={profile.company}
          socials={profile.socials}
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
