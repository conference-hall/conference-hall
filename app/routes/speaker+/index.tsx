import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { SpeakerActivities } from '~/.server/speaker-activities/speaker-activities.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

import { useSpeakerProfile } from '../__components/contexts/speaker-profile-context.tsx';
import { SpeakerActivitiesSection } from './__components/speaker-activities-section.tsx';
import { SpeakerDetailsSection } from './__components/speaker-details-section.tsx';

export const meta = mergeMeta(() => [{ title: 'Activity | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);

  const page = parseUrlPage(request.url);
  const { activities, nextPage, hasNextPage } = await SpeakerActivities.for(userId).list(page);

  return { activities, nextPage, hasNextPage };
};

export default function ProfileRoute() {
  const profile = useSpeakerProfile();
  const { activities, nextPage, hasNextPage } = useLoaderData<typeof loader>();

  return (
    <Page className="grid grid-cols-1 items-start lg:grid-cols-3">
      <H1 srOnly>Your activity</H1>

      <SpeakerDetailsSection
        email={profile.email}
        picture={profile.picture}
        bio={profile.bio}
        location={profile.location}
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
