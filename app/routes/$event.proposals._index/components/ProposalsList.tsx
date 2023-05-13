import { InboxIcon } from '@heroicons/react/24/outline';

import { ProposalCard } from '~/components/proposals/ProposalCard';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { CfpLabel } from '~/routes/$event.proposals._index/components/CfpLabel';
import type { EventProposals } from '~/routes/$event.proposals._index/route';
import type { CfpState } from '~/schemas/event';

type Props = {
  proposals: EventProposals;
  cfpState: CfpState;
};

export function ProposalsList({ proposals, cfpState }: Props) {
  if (proposals.length === 0) {
    return (
      <EmptyState icon={InboxIcon} label="No proposals submitted!">
        <CfpLabel cfpState={cfpState} />
      </EmptyState>
    );
  }

  return (
    <ul aria-label="Proposals list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.id} {...proposal} />
      ))}
    </ul>
  );
}
