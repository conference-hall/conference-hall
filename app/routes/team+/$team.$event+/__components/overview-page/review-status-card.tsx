import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';

type Props = { reviewEnabled: boolean; showActions: boolean };

const STATUSES = {
  enabled: { status: 'success', label: 'Reviews are enabled', subtitle: 'All team members can review proposals.' },
  disabled: { status: 'disabled', label: 'Reviews are disabled', subtitle: 'No one can review the proposals.' },
} as const;

export function ReviewStatusCard({ reviewEnabled, showActions }: Props) {
  const props = STATUSES[reviewEnabled ? 'enabled' : 'disabled'];

  return (
    <StatusCard {...props}>
      {showActions ? (
        <Link to="settings/review" iconRight={ArrowRightIcon} weight="medium">
          Change
        </Link>
      ) : null}
    </StatusCard>
  );
}
