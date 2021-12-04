import { useLoaderData } from 'remix';
import { Container } from '~/components/ui/Container';
import { EventDescription, getEventDescription } from '~/server/event/get-event-description.server';
import { SectionInfo } from '~/components/event/SectionInfo';
import { SectionActions } from '~/components/event/SectionActions';

export const loader = getEventDescription;

export default function EventRoute() {
  const data = useLoaderData<EventDescription>();
  return (
    <Container className="-mt-24 grid grid-cols-1 items-start lg:grid-cols-3 sm:gap-8">
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
