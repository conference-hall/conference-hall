import { useTranslation } from 'react-i18next';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { useCurrentEvent } from '../event-page-context.tsx';
import { CfpSection } from './components/cfp-section.tsx';
import { DetailsSection } from './components/details-section.tsx';
import { TrackSection } from './components/track-section.tsx';

export default function EventRoute() {
  const { t } = useTranslation();
  const currentEvent = useCurrentEvent();

  const hasTracks = currentEvent.formats.length > 0 || currentEvent.categories.length > 0;

  return (
    <Page className="space-y-4 lg:space-y-8">
      <Card as="section" p={8} className="space-y-4 lg:space-y-8">
        <CfpSection
          cfpState={currentEvent.cfpState}
          cfpStart={currentEvent.cfpStart}
          cfpEnd={currentEvent.cfpEnd}
          timezone={currentEvent.timezone}
        />
      </Card>

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
        <div className="mt-4 gap-4 grid grid-cols-1 lg:mt-8 md:grid-cols-2 lg:gap-8">
          <TrackSection title={t('common.formats')} tracks={currentEvent.formats} />
          <TrackSection title={t('common.categories')} tracks={currentEvent.categories} />
        </div>
      )}
    </Page>
  );
}
