import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';
import type { EventVisibility } from '~/types/events.types.ts';

type Props = { slug: string; visibility: EventVisibility; showActions: boolean };

const STATUSES = {
  PUBLIC: { status: 'success', label: 'The event is public', subtitle: 'The event is available in the search.' },
  PRIVATE: {
    status: 'warning',
    label: 'The event is private',
    subtitle: 'The event is accessible only through its link.',
  },
} as const;

export function VisibilityStatusCard({ slug, visibility, showActions }: Props) {
  const props = STATUSES[visibility];

  return (
    <StatusCard {...props}>
      {showActions ? (
        <Link to="settings" iconRight={ArrowRightIcon} weight="medium">
          Change
        </Link>
      ) : null}
    </StatusCard>
  );
}
