import { InboxIcon } from '@heroicons/react/24/outline';
import { Container } from '~/design-system/Container';
import { EmptyState } from '~/design-system/EmptyState';

export function NoProposals() {
  return (
    <Container className="my-4 sm:my-16">
      <EmptyState
        icon={InboxIcon}
        label="No proposals yet!"
        description="Open the call for paper and share your event link to get more proposals!"
      >
        <h2 className="sr-only">Event proposals</h2>
      </EmptyState>
    </Container>
  );
}
