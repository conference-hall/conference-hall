import { Page } from '~/design-system/layouts/PageContent.tsx';

import { CfpSection } from './__components/CfpSection.tsx';
import { DetailsSection } from './__components/DetailsSection.tsx';
import { TrackSection } from './__components/TrackSection.tsx';
import { useEvent } from './__components/useEvent.tsx';

export default function EventRoute() {
  const { event } = useEvent();

  const hasTracks = event.formats.length > 0 || event.categories.length > 0;

  return (
    <>
      <CfpSection cfpState={event.cfpState} cfpStart={event.cfpStart} cfpEnd={event.cfpEnd} />

      <Page>
        <DetailsSection
          type={event.type}
          description={event.description}
          websiteUrl={event.websiteUrl}
          contactEmail={event.contactEmail}
          codeOfConductUrl={event.codeOfConductUrl}
        />

        {hasTracks && (
          <div className="mt-4 gap-4 grid grid-cols-1 lg:mt-8 md:grid-cols-2 lg:gap-8">
            <TrackSection title="Formats" tracks={event.formats} />
            <TrackSection title="Categories" tracks={event.categories} />
          </div>
        )}
      </Page>
    </>
  );
}
