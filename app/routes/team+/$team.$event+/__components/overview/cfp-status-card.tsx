import { StatusCard } from '~/design-system/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';
import { cfpColorStatus, formatCFPDate, formatCFPState } from '~/libs/formatters/cfp.ts';
import { ClientOnly } from '~/routes/__components/utils/client-only.tsx';
import type { CfpState } from '~/types/events.types.ts';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; showActions: boolean };

export function CfpStatusCard({ cfpState, cfpStart, cfpEnd, showActions }: Props) {
  return (
    <ClientOnly fallback={<StatusCard.Fallback showActions={showActions} />}>
      {() => (
        <StatusCard
          status={cfpColorStatus(cfpState, cfpStart, cfpEnd)}
          label={formatCFPState(cfpState, cfpStart, cfpEnd)}
          subtitle={formatCFPDate(cfpState, cfpStart, cfpEnd, 'Pp')}
        >
          {showActions ? (
            <Link to="settings/cfp" className="font-medium">
              Change →
            </Link>
          ) : null}
        </StatusCard>
      )}
    </ClientOnly>
  );
}
