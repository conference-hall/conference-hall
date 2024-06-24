import { FireIcon } from '@heroicons/react/24/outline';

import { AlertInfo } from '~/design-system/alerts.tsx';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';

type MaxProposalsReachedProps = { maxProposals: number };

export function MaxProposalsReached({ maxProposals }: MaxProposalsReachedProps) {
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

type MaxProposalsAlertProps = { proposalsCount: number; maxProposals: number };

export function MaxProposalsAlert({ proposalsCount, maxProposals }: MaxProposalsAlertProps) {
  return (
    <AlertInfo aria-label="Maximum of proposals by speaker">
      {`You can submit a maximum of `}
      <strong>{`${maxProposals} proposals by speaker. `}</strong>
      {`You currently have submitted `}
      <strong>{`${proposalsCount} proposals.`}</strong>
    </AlertInfo>
  );
}
