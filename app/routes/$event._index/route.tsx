import { useCatch } from '@remix-run/react';
import { Container } from '~/design-system/Container';
import { useEvent } from '../$event/route';
import { CfpSection } from './components/CfpSection';
import { TrackSection } from './components/TrackSection';
import { DetailsSection } from './components/DetailsSection';

export default function EventRoute() {
  const event = useEvent();

  const hasTracks = event.formats.length > 0 || event.categories.length > 0;

  return (
    <Container>
      <CfpSection cfpState={event.cfpState} cfpStart={event.cfpStart} cfpEnd={event.cfpEnd} />

      <DetailsSection
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
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="my-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
