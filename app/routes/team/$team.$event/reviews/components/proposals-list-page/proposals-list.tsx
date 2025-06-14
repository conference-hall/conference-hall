import { InboxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { List } from '~/design-system/list/list.tsx';
import { useListSelection } from '~/design-system/list/use-list-selection.tsx';
import { ListHeader } from './list/header.tsx';
import { ProposalItem } from './list/proposal-item.tsx';
import { SelectAllBanner } from './list/select-all-banner.tsx';
import type { ProposalData } from './list/types.ts';

type Props = {
  proposals: Array<ProposalData>;
  pagination: { current: number; total: number };
  statistics: { total: number; reviewed: number };
  filtersHash: string;
};

export function ProposalsList({ proposals, pagination, statistics, filtersHash }: Props) {
  const { t } = useTranslation();
  const ids = proposals.map((proposal) => proposal.id);

  const selector = useListSelection(ids, statistics.total, filtersHash);

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
      <List.Content aria-label={t('event-management.proposals.list')}>
        {proposals.map((proposal) => (
          <List.Row key={proposal.id} className="hover:bg-gray-50 px-4">
            <ProposalItem
              proposal={proposal}
              isSelected={selector.isSelected(proposal.id)}
              isAllPagesSelected={selector.isAllPagesSelected}
              toggle={selector.toggle(proposal.id)}
            />
          </List.Row>
        ))}
        {statistics.total === 0 ? (
          <EmptyState icon={InboxIcon} label={t('event-management.proposals.empty')} noBorder />
        ) : null}
      </List.Content>

      <List.PaginationFooter current={pagination.current} pages={pagination.total} total={statistics.total} />
    </List>
  );
}
