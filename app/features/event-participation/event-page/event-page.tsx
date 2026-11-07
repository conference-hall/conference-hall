import { TicketIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Callout } from '~/design-system/callout.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { OptionalAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { getSubmissionAccessForSlug } from '../cfp-submission/services/submission-access.server.ts';
import { useCurrentEvent } from '../event-page-context.tsx';
import type { Route } from './+types/event-page.ts';
import { CfpSection } from './components/cfp-section.tsx';
import { DetailsSection } from './components/details-section.tsx';
import { TrackSection } from './components/track-section.tsx';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const user = context.get(OptionalAuthContext);
  return getSubmissionAccessForSlug(params.event, user?.id);
};

export default function EventRoute({ loaderData: access }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentEvent = useCurrentEvent();

  const hasTracks = currentEvent.formats.length > 0 || currentEvent.categories.length > 0;

  return (
    <Page className="space-y-4 lg:space-y-8">
      {access.viaPass ? <Callout title={t('event.submission-pass.banner')} icon={TicketIcon} /> : null}

      <CfpSection
        slug={currentEvent.slug}
        canSubmit={access.canSubmit}
        cfpState={currentEvent.cfpState}
        cfpStart={currentEvent.cfpStart}
        cfpEnd={currentEvent.cfpEnd}
      />

      <DetailsSection
        description={currentEvent.description}
        websiteUrl={currentEvent.websiteUrl}
        contactEmail={currentEvent.contactEmail}
        codeOfConductUrl={currentEvent.codeOfConductUrl}
        conferenceStart={currentEvent.conferenceStart}
        conferenceEnd={currentEvent.conferenceEnd}
        onlineEvent={currentEvent.onlineEvent}
        location={currentEvent.location}
        type={currentEvent.type}
        timezone={currentEvent.timezone}
      />

      {hasTracks && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-8 lg:gap-8">
          <TrackSection title={t('common.formats')} tracks={currentEvent.formats} />
          <TrackSection title={t('common.categories')} tracks={currentEvent.categories} />
        </div>
      )}
    </Page>
  );
}
