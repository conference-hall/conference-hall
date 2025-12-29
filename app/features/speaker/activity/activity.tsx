import { useTranslation } from 'react-i18next';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { getRequiredAuthUser } from '~/shared/authentication/auth.middleware.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { useSpeakerProfile } from '../speaker-profile-context.tsx';
import type { Route } from './+types/activity.ts';
import { SpeakerActivitiesSection } from './components/speaker-activities-section.tsx';
import { SpeakerDetailsSection } from './components/speaker-details-section.tsx';
import { SpeakerActivities } from './services/activity.server.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Activity | Conference Hall' }]);
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const page = parseUrlPage(request.url);
  return SpeakerActivities.for(authUser.id).list(page);
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
