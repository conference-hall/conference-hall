import { StatusCard } from '~/design-system/charts/dashboard/status-card.tsx';
import { Link } from '~/design-system/links.tsx';
import { cfpColorStatus, formatCFPDate, formatCFPState } from '~/libs/formatters/cfp.ts';
import type { CfpState } from '~/types/events.types.ts';

type Props = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string; showActions: boolean };

// TODO: Add client only placeholder
export function CfpStatusCard({ cfpState, cfpStart, cfpEnd, showActions }: Props) {
  return (
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
  );
}
