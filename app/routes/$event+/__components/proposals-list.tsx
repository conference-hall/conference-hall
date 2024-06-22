import { InboxIcon } from '@heroicons/react/24/outline';

import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { ProposalCard } from '~/routes/__components/proposals/proposal-card.tsx';
import type { SpeakerProposalStatus } from '~/types/speaker.types';

type Props = {
  proposals: Array<{
    id: string;
    title: string;
    status?: SpeakerProposalStatus;
    speakers: Array<{ picture?: string | null; name?: string | null }>;
  }>;
};

export function ProposalsList({ proposals }: Props) {
  if (proposals.length === 0) {
    return <EmptyState icon={InboxIcon} label="No proposals submitted!" />;
  }

  return (
    <ul aria-label="Proposals list" className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-2">
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.id} {...proposal} />
      ))}
    </ul>
  );
}
