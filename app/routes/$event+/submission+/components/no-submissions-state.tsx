import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';

export function NoSubmissionState() {
  return (
    <EmptyState icon={RocketLaunchIcon} label="No Proposals Submitted Yet">
      <ButtonLink to="new" variant="primary">
        Create a new proposal
      </ButtonLink>
    </EmptyState>
  );
}
