import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { SpeakerActivities } from '~/.server/speaker-activities/speaker-activities.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { useSpeakerProfile } from '../__components/contexts/speaker-profile-context.tsx';
import type { Route } from './+types/index.ts';
import { SpeakerActivitiesSection } from './__components/speaker-activities-section.tsx';
import { SpeakerDetailsSection } from './__components/speaker-details-section.tsx';

export const meta = () => [{ title: 'Activity | Conference Hall' }];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const page = parseUrlPage(request.url);
  return SpeakerActivities.for(userId).list(page);
};

export default function ProfileRoute({ loaderData }: Route.ComponentProps) {
  const profile = useSpeakerProfile();
  const { activities, nextPage, hasNextPage } = loaderData;

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
