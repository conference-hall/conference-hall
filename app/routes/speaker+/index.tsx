import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { parseUrlPage } from '~/.server/shared/pagination.cap.ts';
import { SpeakerActivities } from '~/.server/speaker-activities/speaker-activities.ts';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

import { SpeakerActivitiesSection } from './__components/speaker-activities-section.tsx';
import { SpeakerDetailsSection } from './__components/speaker-details-section.tsx';

export const meta = mergeMeta(() => [{ title: 'Activity | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const profile = await SpeakerProfile.for(userId).get();

  const page = parseUrlPage(request.url);
  const { activities, nextPage, hasNextPage } = await SpeakerActivities.for(userId).list(page);

  return json({ profile, activities, nextPage, hasNextPage });
};

export default function ProfileRoute() {
  const { profile, activities, nextPage, hasNextPage } = useLoaderData<typeof loader>();

  return (
    <Page className="grid grid-cols-1 items-start lg:grid-cols-3">
      <h1 className="sr-only">Speaker activity</h1>

      <SpeakerDetailsSection
        email={profile.email}
        picture={profile.picture}
        bio={profile.bio}
        address={profile.address}
        socials={profile.socials}
      />

      <SpeakerActivitiesSection
        activities={activities}
        nextPage={nextPage}
        hasNextPage={hasNextPage}
        className="lg:col-span-2"
      />
    </Page>
  );
}
