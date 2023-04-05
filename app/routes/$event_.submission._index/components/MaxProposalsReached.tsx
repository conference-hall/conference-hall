import { EmptyState } from '~/design-system/EmptyState';
import { ButtonLink } from '../../../design-system/Buttons';
import { FireIcon } from '@heroicons/react/24/outline';

type Props = { maxProposals: number };

export function MaxProposalsReached({ maxProposals }: Props) {
  return (
    <EmptyState
      icon={FireIcon}
      label={`You have reached the maximum of submitted proposals for the event (${maxProposals} max)`}
    >
      <ButtonLink to="../proposals" relative="path" variant="secondary">
        Check submitted proposals
      </ButtonLink>
    </EmptyState>
  );
}
