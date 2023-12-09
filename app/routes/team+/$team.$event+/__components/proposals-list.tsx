import { List } from '~/design-system/list/List.tsx';
import { useListSelection } from '~/design-system/list/useListSelection';

import { ListHeader } from './list/header';
import { ProposalItem } from './list/proposal-item';
import { SelectAllBanner } from './list/select-all-banner';
import type { ProposalData } from './list/types';

type Props = {
  proposals: Array<ProposalData>;
  pagination: { current: number; total: number };
  statistics: { total: number; reviewed: number };
};

export function ProposalsList({ proposals, pagination, statistics }: Props) {
  const ids = proposals.map((proposal) => proposal.id);
  const selector = useListSelection(ids, statistics.total);

  return (
    <List>
      <ListHeader
        checkboxRef={selector.ref}
        total={statistics.total}
        totalReviewed={statistics.reviewed}
        totalSelected={selector.totalSelected}
        selection={selector.selection}
        isAllPagesSelected={selector.isAllPagesSelected}
      />
      <SelectAllBanner
        total={statistics.total}
        totalSelected={selector.totalSelected}
        isCurrentPageSelected={selector.isCurrentPageSelected}
        isAllPagesSelected={selector.isAllPagesSelected}
        toggleAllPages={selector.toggleAllPages}
      />
      <List.Content>
        {proposals.map((proposal) => (
          <List.Row key={proposal.id} className="hover:bg-gray-50">
            <ProposalItem
              proposal={proposal}
              isSelected={selector.isSelected(proposal.id)}
              isAllPagesSelected={selector.isAllPagesSelected}
              toggle={selector.toggle(proposal.id)}
            />
          </List.Row>
        ))}
      </List.Content>
      <List.PaginationFooter current={pagination.current} pages={pagination.total} total={statistics.total} />
    </List>
  );
}
