import { InboxIcon } from '@heroicons/react/24/outline';
import { Container } from '~/design-system/layouts/Container';
import { EmptyState } from '~/design-system/layouts/EmptyState';

export function NoProposals() {
  return (
    <Container className="my-4 sm:my-8">
      <EmptyState icon={InboxIcon} label="No proposals yet!">
        <h2 className="sr-only">Event proposals</h2>
      </EmptyState>
    </Container>
  );
}
