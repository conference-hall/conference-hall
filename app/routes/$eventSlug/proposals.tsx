import { Container } from '~/components/layout/Container';
import { ProposalsEmptyState } from '../../features/event-speaker-proposals/components/ProposalsEmptyState';

export default function EventSpeakerProposalsRoute() {
  return (
    <Container className="mt-8">
      <ProposalsEmptyState />
    </Container>
  );
}
