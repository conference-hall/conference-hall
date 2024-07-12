import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';

import { CfpSection } from './__components/cfp-section.tsx';
import { DetailsSection } from './__components/details-section.tsx';
import { TrackSection } from './__components/track-section.tsx';
import { useEvent } from './__components/use-event.tsx';

export default function EventRoute() {
  const { event } = useEvent();

  const hasTracks = event.formats.length > 0 || event.categories.length > 0;

  return (
    <Page className="space-y-4 lg:space-y-8">
      <Card as="section" p={8} className="space-y-4 lg:space-y-8">
        <CfpSection
          cfpState={event.cfpState}
          cfpStart={event.cfpStart}
          cfpEnd={event.cfpEnd}
          timezone={event.timezone}
        />
      </Card>

      <DetailsSection
        description={event.description}
        websiteUrl={event.websiteUrl}
        contactEmail={event.contactEmail}
        codeOfConductUrl={event.codeOfConductUrl}
        conferenceStart={event.conferenceStart}
        conferenceEnd={event.conferenceEnd}
        address={event.address}
        type={event.type}
        timezone={event.timezone}
      />

      {hasTracks && (
        <div className="mt-4 gap-4 grid grid-cols-1 lg:mt-8 md:grid-cols-2 lg:gap-8">
          <TrackSection title="Formats" tracks={event.formats} />
          <TrackSection title="Categories" tracks={event.categories} />
        </div>
      )}
    </Page>
  );
}
