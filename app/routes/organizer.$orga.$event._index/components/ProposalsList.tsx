import { Text } from '~/design-system/Typography';
import { UpdateStatusMenu } from './UpdateStatusMenu';
import { ExportProposalsStatus } from './ExportProposalsMenu';
import { useCheckboxSelection } from '~/design-system/useCheckboxSelection';
import { ProposaListRow } from './ProposalListRow';
import { useMemo } from 'react';
import { Checkbox } from '~/design-system/forms/Checkboxes';

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
    <div className="-mx-4 mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
      <div className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 sm:px-6">
        <div className="flex flex-row items-center">
          <Checkbox ref={checkboxRef} checked={checked} onChange={toggleAll} className="mr-6" />
          <div className="flex items-baseline">
            {selection.length === 0 ? <Text>{total} proposals</Text> : <Text>{selection.length} selected</Text>}
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <UpdateStatusMenu variant="secondary" size="s" selection={selection} />
          <ExportProposalsStatus variant="secondary" size="s" selection={selection} total={total} />
        </div>
      </div>
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
        <tbody className="divide-y divide-gray-200 bg-white">
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
    </div>
  );
}
