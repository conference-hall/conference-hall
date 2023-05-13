import type { ProposalData } from './ProposalListRow';
import { ProposaListRow } from './ProposalListRow';
import { Card } from '~/design-system/layouts/Card';

type Props = {
  proposals: Array<ProposalData>;
  isSelected: (id: string) => boolean;
  onSelect: (id: string, checked: boolean) => void;
};

export function ProposalsList({ proposals, isSelected, onSelect }: Props) {
  return (
    <Card as="table" className="min-w-full">
      <thead className="sr-only">
        <tr>
          <th scope="col" className="hidden sm:table-cell">
            Select a proposal
          </th>
          <th scope="col">Proposal details</th>
          <th scope="col" className="hidden sm:table-cell">
            Status
          </th>
          <th scope="col" className="hidden lg:table-cell">
            Reviews details
          </th>
          <th scope="col" className="hidden sm:table-cell">
            Global note
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {proposals.map((proposal) => (
          <ProposaListRow
            key={proposal.id}
            proposal={proposal}
            isSelected={isSelected(proposal.id)}
            onSelect={(e) => onSelect(proposal.id, e.target.checked)}
          />
        ))}
      </tbody>
    </Card>
  );
}
