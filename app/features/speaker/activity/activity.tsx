import { useTranslation } from 'react-i18next';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { SpeakerActivities } from '~/.server/speaker-activities/speaker-activities.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { H1 } from '~/shared/design-system/typography.tsx';
import { useSpeakerProfile } from '../../../routes/components/contexts/speaker-profile-context.tsx';
import type { Route } from './+types/activity.ts';
import { SpeakerActivitiesSection } from './components/speaker-activities-section.tsx';
import { SpeakerDetailsSection } from './components/speaker-details-section.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Activity | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const page = parseUrlPage(request.url);
  return SpeakerActivities.for(userId).list(page);
};

export default function ProfileRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const profile = useSpeakerProfile();
  const { activities, nextPage, hasNextPage } = loaderData;

  return (
    <Page className="grid grid-cols-1 items-start lg:grid-cols-3">
      <H1 srOnly>{t('speaker.activity.heading')}</H1>

      <SpeakerDetailsSection
        email={profile.email}
        bio={profile.bio}
        location={profile.location}
        socialLinks={profile.socialLinks}
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
