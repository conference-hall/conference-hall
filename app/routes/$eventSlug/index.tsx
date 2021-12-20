import { useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { EventDescription, loadEvent } from '~/features/event-page/event.server';
import { ButtonLink } from '../../components/Buttons';
import { Heading } from '../../components/Heading';
import { SectionActions } from '../../features/event-page/components/SectionActions';
import { SectionInfo } from '../../features/event-page/components/SectionInfo';
import { formatCFPDate, formatCFPState } from '../../utils/event';

export const loader = loadEvent;

export default function EventRoute() {
  const data = useLoaderData<EventDescription>();
  return (
    <Container className="mt-8 grid grid-cols-1 items-start sm:gap-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <Heading description={formatCFPDate(data.cfpState, data.cfpStart, data.cfpEnd)}>
          {formatCFPState(data.cfpState)}
        </Heading>
        {data.cfpState === 'OPENED' && (
          <div className="flex-shrink-0">
            <ButtonLink to="submission">Submit a proposal</ButtonLink>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 items-start lg:grid-cols-3 sm:gap-8">
        <SectionInfo
          className="lg:col-span-2"
          description={data.description}
          formats={data.formats}
          categories={data.categories}
        />
        <SectionActions
          bannerUrl={data.bannerUrl}
          websiteUrl={data.websiteUrl}
          codeOfConductUrl={data.codeOfConductUrl}
          contactEmail={data.contactEmail}
        />
      </div>
    </Container>
  );
}
