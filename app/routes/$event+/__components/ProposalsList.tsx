import { InboxIcon } from '@heroicons/react/24/outline';

import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { ProposalCard } from '~/routes/__components/proposals/ProposalCard.tsx';
import type { CfpState } from '~/routes/__types/event.ts';

import type { EventProposals } from '../proposals.index.tsx';
import { CfpLabel } from './CfpLabel.tsx';

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
