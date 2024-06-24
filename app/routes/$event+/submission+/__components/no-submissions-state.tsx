import { PlusIcon } from '@heroicons/react/20/solid';

import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';

export function NoSubmissionState() {
  return (
    <EmptyState>
      <ButtonLink to="new" variant="primary" iconLeft={PlusIcon}>
        Create a new proposal
      </ButtonLink>
    </EmptyState>
  );
}
