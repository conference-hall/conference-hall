import type { CfpState } from '~/schemas/event';
import type { EventProposals } from '~/routes/$event.proposals._index/route';
import { ExclamationCircleIcon, InboxIcon } from '@heroicons/react/24/outline';
import { CfpLabel } from '../CfpInfo';
import { CardLink } from '~/design-system/Card';
import { AvatarGroup } from '~/design-system/Avatar';
import { EmptyState } from '~/design-system/EmptyState';
import { ProposalStatusLabel } from './ProposalStatusLabel';

type Props = {
  proposals: EventProposals;
  cfpState: CfpState;
};

export function ProposalsList({ proposals, cfpState }: Props) {
  if (cfpState !== 'OPENED' && proposals.length === 0) {
    return (
      <EmptyState icon={ExclamationCircleIcon}>
        <CfpLabel cfpState={cfpState} />
      </EmptyState>
    );
  }

  if (proposals.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        label="No submitted proposals yet!"
        description="Get started by submitting your first proposal."
      />
    );
  }

  return (
    <ul aria-label="Proposals list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {proposals.map((proposal) => (
        <CardLink as="li" key={proposal.id} to={proposal.id}>
          <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="truncate text-base font-semibold text-indigo-600">{proposal.title}</p>
              <AvatarGroup avatars={proposal.speakers} displayNames className="mt-2" />
            </div>

            <ProposalStatusLabel proposal={proposal} isCfpOpen={cfpState === 'OPENED'} />
          </div>
        </CardLink>
      ))}
    </ul>
  );
}
