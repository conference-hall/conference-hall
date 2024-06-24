import { Page } from '~/design-system/layouts/page.tsx';

import { DetailsSection } from './__components/details-section.tsx';
import { TrackSection } from './__components/track-section.tsx';
import { useEvent } from './__components/use-event.tsx';

export default function EventRoute() {
  const { event } = useEvent();

  const hasTracks = event.formats.length > 0 || event.categories.length > 0;

  return (
    <Page>
      <DetailsSection
        description={event.description}
        websiteUrl={event.websiteUrl}
        contactEmail={event.contactEmail}
        codeOfConductUrl={event.codeOfConductUrl}
        cfpState={event.cfpState}
        cfpStart={event.cfpStart}
        cfpEnd={event.cfpEnd}
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
