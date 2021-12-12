import { LoaderFunction, useLoaderData } from 'remix';
import { Container } from '~/components/layout/Container';
import { ButtonLink } from '../../../components/Buttons';
import { Heading } from '../../../components/Heading';
import { requireUserSession } from '../../../features/auth/auth.server';
import { ProposalsEmptyState } from '../../../features/event-proposals/components/ProposalsEmptyState';
import { ProposalsList } from '../../../features/event-proposals/components/ProposalsList';
import { loadSpeakerProposals, SpeakerProposals } from '../../../features/event-proposals/list-proposals.server';

export const loader: LoaderFunction = async ({ request, context, params }) => {
  await requireUserSession(request);
  return loadSpeakerProposals({ request, context, params });
};

export default function EventSpeakerProposalsRoute() {
  const proposals = useLoaderData<SpeakerProposals>();

  if (proposals.length === 0) {
    return (
      <Container className="mt-8">
        <ProposalsEmptyState />
      </Container>
    );
  }

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <Heading description="All your draft and submitted proposals for the event">Your proposals</Heading>
        <div className="flex-shrink-0">
          <ButtonLink to="../submission">Submit a proposal</ButtonLink>
        </div>
      </div>
      <div className="mt-8">
        <ProposalsList proposals={proposals} />
      </div>
    </Container>
  );
}
