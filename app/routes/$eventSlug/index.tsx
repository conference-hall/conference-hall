import { useCatch, useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { EventDescription, loadEvent } from '~/features/event-page/event.server';
import { SectionActions } from '../../features/event-page/components/SectionActions';
import { SectionInfo } from '../../features/event-page/components/SectionInfo';

export const loader = loadEvent;

export default function EventRoute() {
  const data = useLoaderData<EventDescription>();
  return (
    <Container className="mt-8 grid grid-cols-1 items-start sm:gap-8">
      <div className="grid grid-cols-1 items-start lg:grid-cols-3 sm:gap-8">
        <SectionInfo
          className="lg:col-span-2"
          description={data.description}
          cfpStart={data.cfpStart}
          cfpEnd={data.cfpEnd}
          cfpState={data.cfpState}
          formats={data.formats}
          categories={data.categories}
        />
        <SectionActions
          className="lg:-mt-40"
          address={data.address}
          bannerUrl={data.bannerUrl}
          websiteUrl={data.websiteUrl}
          codeOfConductUrl={data.codeOfConductUrl}
          contactEmail={data.contactEmail}
          cfpState={data.cfpState}
        />
      </div>
    </Container>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
