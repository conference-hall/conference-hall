import { useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { EventDescription, loadEvent } from '~/features/event-page/event.server';
import { SectionActions } from '../../features/event-page/components/SectionActions';
import { SectionInfo } from '../../features/event-page/components/SectionInfo';

export const loader = loadEvent;

export default function EventRoute() {
  const data = useLoaderData<EventDescription>();
  return (
    <Container className="mt-8 grid grid-cols-1 items-start lg:grid-cols-3 sm:gap-8">
      <SectionInfo
        className="lg:col-span-2"
        description={data.description}
        cfpState={data.cfpState}
        cfpStart={data.cfpStart}
        cfpEnd={data.cfpEnd}
        formats={data.formats}
        categories={data.categories}
      />
      <SectionActions
        bannerUrl={data.bannerUrl}
        websiteUrl={data.websiteUrl}
        codeOfConductUrl={data.codeOfConductUrl}
        contactEmail={data.contactEmail}
        cfpState={data.cfpState}
      />
    </Container>
  );
}
