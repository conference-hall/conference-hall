import { UpdateStatusMenu } from './UpdateStatusMenu';
import { ExportProposalsStatus } from './ExportProposalsMenu';
import { useCheckboxSelection } from '~/design-system/useCheckboxSelection';
import { ProposaListRow } from './ProposalListRow';
import { useMemo } from 'react';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Card } from '~/design-system/layouts/Card';
import { EmptyState } from '~/design-system/layouts/EmptyState';
import { InboxIcon } from '@heroicons/react/20/solid';

export type Proposal = {
  id: string;
  title: string;
  status: string;
  speakers: (string | null)[];
  ratings: { negatives: number; positives: number; you: number | null; total: number | null };
};

type Props = { proposals: Array<Proposal>; total: number };

export function ProposalsList({ proposals, total }: Props) {
  const ids = useMemo(() => proposals.map(({ id }) => id), [proposals]);

  const { checkboxRef, selection, checked, isSelected, onSelect, toggleAll } = useCheckboxSelection(ids);

  return (
    <div className="flex-1 space-y-4">
      <Card p={4} className="flex items-center justify-between">
        <Checkbox ref={checkboxRef} checked={checked} onChange={toggleAll} className="ml-2">
          {selection.length === 0 ? `${total} proposals` : `${selection.length} selected`}
        </Checkbox>
        <div className="flex flex-row items-center gap-2">
          <UpdateStatusMenu variant="secondary" size="s" selection={selection} />
          <ExportProposalsStatus variant="secondary" size="s" selection={selection} total={total} />
        </div>
      </Card>

      {total > 0 ? (
        <Card>
          <table className="min-w-full">
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
                  Rating details
                </th>
                <th scope="col" className="hidden sm:table-cell">
                  Final rating
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
          </table>
        </Card>
      ) : (
        <EmptyState icon={InboxIcon} label="No proposals found!" className="flex-1" />
      )}
    </div>
  );
}
