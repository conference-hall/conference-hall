import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { useEvent } from '../../$eventSlug';
import { ButtonLink } from '../../../components/Buttons';
import { Heading } from '../../../components/Heading';
import { ProposalsEmptyState } from '../../../features/event-proposals/components/ProposalsEmptyState';
import { ProposalsList } from '../../../features/event-proposals/components/ProposalsList';
import { loadSpeakerProposals, SpeakerProposals } from '../../../features/event-proposals/list-proposals.server';

export const loader = loadSpeakerProposals;

export default function EventSpeakerProposalsRoute() {
  const event = useEvent();
  const proposals = useLoaderData<SpeakerProposals>();

  if (proposals.length === 0) {
    return <ProposalsEmptyState cfpState={event.cfpState} />;
  }

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <Heading description="All your draft and submitted proposals for the event">Your proposals</Heading>
        {event.cfpState === 'OPENED' && (
          <div className="flex-shrink-0">
            <ButtonLink to="../submission">Submit a proposal</ButtonLink>
          </div>
        )}
      </div>
      <div className="mt-8">
        <ProposalsList proposals={proposals} />
      </div>
    </Container>
  );
}
