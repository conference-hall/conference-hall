import { Container } from '~/design-system/layouts/Container';

import { useEvent } from '../$event/route';
import { CfpSection } from './components/CfpSection';
import { DetailsSection } from './components/DetailsSection';
import { TrackSection } from './components/TrackSection';

export default function EventRoute() {
  const { event } = useEvent();

  const hasTracks = event.formats.length > 0 || event.categories.length > 0;

  return (
    <>
      <CfpSection cfpState={event.cfpState} cfpStart={event.cfpStart} cfpEnd={event.cfpEnd} />

      <Container>
        <DetailsSection
          type={event.type}
          description={event.description}
          websiteUrl={event.websiteUrl}
          contactEmail={event.contactEmail}
          codeOfConductUrl={event.codeOfConductUrl}
        />

        {hasTracks && (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-8 sm:grid-cols-2 sm:gap-8">
            <TrackSection title="Formats" subtitle="Talks formats proposed by the conference." tracks={event.formats} />

            <TrackSection
              title="Categories"
              subtitle="Different categories and tracks proposed by the conference."
              tracks={event.categories}
            />
          </div>
        )}
      </Container>
    </>
  );
}
