import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';
import { cfpColorStatus, formatCFPDate, formatCFPState } from '~/libs/formatters/cfp.ts';
import { ClientOnly } from '~/routes/components/utils/client-only.tsx';
import type { CfpState } from '~/types/events.types.ts';

type Props = { cfpState: CfpState; cfpStart: Date | null; cfpEnd: Date | null; timezone: string; showActions: boolean };

export function CfpStatusCard({ cfpState, cfpStart, cfpEnd, timezone, showActions }: Props) {
  return (
    <ClientOnly fallback={<StatusCard.Fallback showActions={showActions} />}>
      {() => (
        <StatusCard
          status={cfpColorStatus(cfpState, cfpStart, cfpEnd)}
          label={formatCFPState(cfpState, cfpStart, cfpEnd)}
          subtitle={formatCFPDate(cfpState, timezone, cfpStart, cfpEnd, 'Pp (z)')}
        >
          {showActions ? (
            <Link to="settings/cfp" iconRight={ArrowRightIcon} weight="medium">
              Change
            </Link>
          ) : null}
        </StatusCard>
      )}
    </ClientOnly>
  );
}
