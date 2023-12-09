import { useCheckboxSelection } from '~/design-system/forms/useCheckboxSelection';
import { List } from '~/design-system/list/List.tsx';

import { ListHeader } from './list/header';
import { ProposalItem } from './list/proposal-item';
import { SelectAllBanner } from './list/select-all-banner';
import type { ProposalData } from './types';

type Props = {
  proposals: Array<ProposalData>;
  pagination: { current: number; total: number };
  statistics: { total: number; reviewed: number };
};

export function ProposalsList({ proposals, pagination, statistics }: Props) {
  const ids = proposals.map((proposal) => proposal.id);
  const selector = useCheckboxSelection(ids, statistics.total);

  return (
    <List>
      <ListHeader
        checkboxRef={selector.checkboxRef}
        checked={selector.allChecked}
        toggle={selector.toggleAll}
        total={statistics.total}
        totalReviewed={statistics.reviewed}
        totalSelected={selector.selection.length}
      />
      <SelectAllBanner total={statistics.total} pageSelected={selector.isPageSelected} />
      <List.Content>
        {proposals.map((proposal) => (
          <List.Row key={proposal.id} className="hover:bg-gray-50">
            <ProposalItem
              proposal={proposal}
              isSelected={selector.isSelected(proposal.id)}
              toggle={(event) => selector.toggle(proposal.id, event)}
            />
          </List.Row>
        ))}
      </List.Content>
      <List.PaginationFooter current={pagination.current} pages={pagination.total} total={statistics.total} />
    </List>
  );
}
